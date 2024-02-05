import axios from "axios";
import {
  DigitalAsset,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";

import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse, Token } from "@/app/blueprint/types";
import {
  ADD_TOKENS_DEPRECATED,
  GET_TOKENS_BY_MINT_ADDRESSES_DEPRECATED,
} from "@the-architects/blueprint-graphql";
import { Mint, fetchAllMint } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";
import { getUmiClient } from "@/utils/umi";
import { handleError } from "@/utils/errors/log-error";

export type TokenMetadata = {
  image: string;
  decimals: number;
  name: string;
  symbol: string;
};

type TokenDbReturnData = {
  affected_rows: number;
  returning: Token[];
};

type Data =
  | TokenDbReturnData
  | NoopResponse
  | {
      error: unknown;
    };

type ModeledToken = {
  name: string;
  symbol?: string;
  imageUrl: string;
  mintAddress: string;
  decimals: number;
};

const isAsset = (
  entity: DigitalAsset | Mint | Token
): entity is DigitalAsset => {
  return "mint" in entity && entity.mint ? true : false;
};

const isMint = (entity: DigitalAsset | Mint): entity is Mint => {
  return "mint" in entity && entity.mint ? false : true;
};

export async function POST(req: NextRequest) {
  const { mintAddresses, noop, cluster } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-token",
      },
      { status: 200 }
    );

  if (!mintAddresses?.length || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const { tokens: tokensInDb }: { tokens: Token[] } = await client.request({
    document: GET_TOKENS_BY_MINT_ADDRESSES_DEPRECATED,
    variables: {
      mintAddresses,
    },
  });

  const umi = getUmiClient();

  const mintAccounts: Mint[] = await fetchAllMint(umi, mintAddresses);
  let assets: DigitalAsset[] = [];

  for (const mintAddress of mintAddresses) {
    try {
      const asset = await fetchDigitalAsset(umi, mintAddress);
      assets.push(asset);
    } catch (error) {}
  }

  const tokensNotInAssets = mintAccounts.filter(
    (mint: Mint) =>
      !assets.find(
        (asset: DigitalAsset) =>
          publicKey(asset.mint).toString() ===
          publicKey(mint.publicKey).toString()
      )
  );

  const assetsPlusTokens = [...assets, ...tokensNotInAssets];

  const assetsPlusTokensInDb = assetsPlusTokens.filter(
    (asset: DigitalAsset | Mint) => {
      if (isAsset(asset)) {
        console.log({
          isAsset: true,
          asset,
          token: tokensInDb.find(
            (token: Token) => publicKey(asset.mint) === token.mintAddress
          ),
        });

        return tokensInDb.find(
          (token: Token) => publicKey(asset.mint) === token.mintAddress
        );
      } else if (isMint(asset)) {
        console.log({
          isMint: true,
          asset,
          token: tokensInDb.find(
            (token: Token) => publicKey(asset.publicKey) === token.mintAddress
          ),
        });
        return tokensInDb.find(
          (token: Token) => publicKey(asset.publicKey) === token.mintAddress
        );
      }
      return false;
    }
  );

  const assetsPlusTokensToFetch = assetsPlusTokens.filter(
    (asset: DigitalAsset | Mint) => {
      if (isAsset(asset)) {
        return !tokensInDb.find(
          (token: Token) => publicKey(asset.mint) === token.mintAddress
        );
      } else if (isMint(asset)) {
        return !tokensInDb.find(
          (token: Token) => publicKey(asset.publicKey) === token.mintAddress
        );
      }
      return false;
    }
  );

  // const modelTokensFromAsset = (asset: DigitalAsset): ModeledToken => {
  //   const pubKey = publicKey(asset.mint).toString();
  //   return {
  //     name: asset?.metadata?.name?.trim()?.length
  //       ? asset?.metadata?.name
  //       : pubKey,
  //     symbol: asset?.metadata?.symbol,
  //     imageUrl: asset?.metadata?.uri,
  //     mintAddress: pubKey,
  //     decimals:
  //       mintAccounts.find(
  //         (mintAccount: Mint) =>
  //           publicKey(mintAccount.publicKey).toString() === pubKey
  //       )?.decimals || 0,
  //   };
  // };

  // const modeledTokensInDb = assetsInDb.map(modelTokensFromAsset);
  // const modeledTokensToFetch = assetsToFetch.map(modelTokensFromAsset);

  console.log("trying to get token metadata...");

  let toAdd: any[] = [];

  for (const entity of assetsPlusTokensToFetch) {
    let modeledToken: ModeledToken;
    if (isAsset(entity)) {
      const asset = entity as DigitalAsset;
      const { data } = await axios.get(asset?.metadata?.uri);
      const imageUrl = data?.image;
      const pubKey = publicKey(asset.mint).toString();

      modeledToken = {
        name: asset?.metadata?.name?.trim()?.length
          ? asset?.metadata?.name
          : pubKey,
        symbol: asset?.metadata?.symbol,
        imageUrl,
        mintAddress: pubKey,
        decimals:
          mintAccounts.find(
            (mintAccount: Mint) =>
              publicKey(mintAccount.publicKey).toString() === pubKey
          )?.decimals || 0,
      };

      toAdd.push(modeledToken);
    } else if (isMint(entity)) {
      const token = entity as Mint;
      const pubKey = publicKey(token.publicKey).toString();
      modeledToken = {
        name: pubKey,
        imageUrl: "",
        mintAddress: pubKey,
        decimals: token?.decimals || 0,
      };
      toAdd.push(modeledToken);
    }
  }

  console.log({
    tokensNotInAssets,
    assetsPlusTokens,
    assetsPlusTokensInDb,
    assetsPlusTokensToFetch,
    mintAccounts,
    assets,
    toAdd,
  });

  try {
    const {
      insert_tokens: addedTokens,
    }: { insert_tokens: { affected_rows: string; returning: Token[] } } =
      await client.request({
        document: ADD_TOKENS_DEPRECATED,
        variables: {
          tokens: toAdd,
        },
      });
    return NextResponse.json(
      {
        assets,
        addedTokens: addedTokens?.returning,
        allTokens: [...tokensInDb, ...addedTokens?.returning],
      } || [],
      { status: 200 }
    );
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

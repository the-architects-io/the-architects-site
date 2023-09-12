import axios from "axios";
import {
  Metadata,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";

import { RPC_ENDPOINT } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse, Token } from "@/app/blueprint/types";
import { ADD_TOKENS } from "@/graphql/mutations/add-tokens";
import { Connection } from "@solana/web3.js";
import {
  Metaplex,
  PublicKey,
  TokenWithMint,
  findMetadataPda,
} from "@metaplex-foundation/js";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";
import {
  SPL_TOKEN_PROGRAM_ID,
  fetchAllMint,
} from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { getUmiClient } from "@/utils/umi";

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

export async function POST(req: NextRequest) {
  const { mintAddresses, noop } = await req.json();

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
    document: GET_TOKENS_BY_MINT_ADDRESSES,
    variables: {
      mintAddresses,
    },
  });

  console.log("tokensInDb: ", tokensInDb);

  const mintAddressesInDb = tokensInDb.map((token) => token.mintAddress);
  const mintAddressesToFetch = mintAddresses
    .filter((mintAddress: string) => !mintAddressesInDb.includes(mintAddress))
    .map((mintAddress: string) => publicKey(mintAddress));

  console.log("trying to get token metadata...");

  const umi = getUmiClient();

  const mintAccounts = await fetchAllMint(umi, mintAddressesToFetch);

  let tokensToAdd: any[] = [];

  for (const token of mintAccounts) {
    let tokenToAdd;
    const pubKey = publicKey(token.publicKey);
    try {
      const asset = await fetchDigitalAsset(umi, pubKey);
      if (asset) {
        console.log("meta: ", asset?.metadata);
        tokenToAdd = {
          name: asset?.metadata?.name?.trim()?.length
            ? asset?.metadata?.name
            : pubKey,
          symbol: asset?.metadata?.symbol,
          imageUrl: asset?.metadata?.uri,
        };
      }
      tokenToAdd = {
        ...tokenToAdd,
        mintAddress: publicKey(token.publicKey).toString(),
        decimals: token.decimals,
      };
    } catch (error) {}
    if (tokenToAdd) tokensToAdd.push(tokenToAdd);
  }

  console.log({
    tokensToAdd,
  });

  try {
    const {
      insert_tokens: addedTokens,
    }: { insert_tokens: { affected_rows: string; returning: Token[] } } =
      await client.request({
        document: ADD_TOKENS,
        variables: {
          tokens: tokensToAdd,
        },
      });
    return NextResponse.json(
      {
        addedTokens: addedTokens?.returning,
        allTokens: [...tokensInDb, ...addedTokens?.returning],
      } || [],
      { status: 200 }
    );
  } catch (error) {
    console.log("error: ", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

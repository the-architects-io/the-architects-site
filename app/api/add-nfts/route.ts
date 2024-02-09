import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { Token, TokenDeprecated } from "@/app/blueprint/types";
import { getRpcEndpoint } from "@/utils/rpc";
import {
  ADD_TOKENS_DEPRECATED,
  GET_TOKENS_BY_MINT_ADDRESSES_DEPRECATED,
} from "@the-architects/blueprint-graphql";

export async function POST(req: NextRequest) {
  const { hashList, noop, nftCollectionId } = await req.json();

  if (noop) {
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-nfts",
      },
      {
        status: 200,
      }
    );
  }

  if (!hashList.length || !nftCollectionId) {
    return NextResponse.json(
      {
        error: "Required fields not set",
      },
      {
        status: 500,
      }
    );
  }

  const jsonHashList = JSON.parse(hashList);
  if (!jsonHashList.length) {
    return NextResponse.json(
      {
        error: "Could not resolve hash list",
      },
      {
        status: 500,
      }
    );
  }

  const connection = new Connection(getRpcEndpoint());
  const metaplex = Metaplex.make(connection);
  const mints = jsonHashList.map((address: string) => new PublicKey(address));
  const nftMetasFromMetaplex: any[] = await metaplex
    .nfts()
    .findAllByMintList({ mints });

  if (!nftMetasFromMetaplex.length) {
    return NextResponse.json(
      {
        error: "No nfts fetched from metaplex",
      },
      {
        status: 500,
      }
    );
  }

  const nftsWithMetadata = await fetchNftsWithMetadata(
    nftMetasFromMetaplex,
    metaplex
  );

  const existingTokensResponse: { tokens: TokenDeprecated[] } =
    await client.request({
      document: GET_TOKENS_BY_MINT_ADDRESSES_DEPRECATED,
      variables: {
        mintAddresses: jsonHashList,
      },
    });

  const existingMintAddresses = existingTokensResponse.tokens.map(
    (token: TokenDeprecated) => token.mintAddress
  );
  const newNFTs = nftsWithMetadata.filter(
    (nft) => !existingMintAddresses.includes(nft.mintAddress)
  );

  const tokensToAdd = newNFTs.map(
    ({ mintAddress, imageUrl, symbol, name }) => ({
      decimals: 0,
      imageUrl,
      mintAddress,
      symbol,
      name,
    })
  );

  if (tokensToAdd.length > 0) {
    await client.request({
      document: ADD_TOKENS_DEPRECATED,
      variables: {
        tokens: tokensToAdd,
      },
    });
  }

  return NextResponse.json(
    {
      success: true,
      characters: tokensToAdd,
      numbeOfNftsAdded: tokensToAdd.length,
    },
    {
      status: 200,
    }
  );
}

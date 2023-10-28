import { client } from "@/graphql/backend-client";
import { ADD_TOKENS } from "@/graphql/mutations/add-tokens";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/constants/constants";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { Token } from "@/app/blueprint/types";

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

  const connection = new Connection(RPC_ENDPOINT);
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

  const existingTokensResponse: { tokens: Token[] } = await client.request({
    document: GET_TOKENS_BY_MINT_ADDRESSES,
    variables: {
      mintAddresses: jsonHashList,
    },
  });

  const existingMintAddresses = existingTokensResponse.tokens.map(
    (token: Token) => token.mintAddress
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
      document: ADD_TOKENS,
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

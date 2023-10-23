import { client } from "@/graphql/backend-client";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GET_TOKEN_BY_MINT_ADDRESS } from "@/graphql/queries/get-token-by-mint-address";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/constants/constants";
import { fetchNftsWithMetadata } from "@/utils/nfts/fetch-nfts-with-metadata";
import { Token } from "@/app/blueprint/types";

export async function POST(req: NextRequest) {
  const { hashList, noop, nftCollectionId, apiKey } = await req.json();

  if (!process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  const isValidApiKey = process.env.BLUEPRINT_API_KEY === apiKey;

  if (!isValidApiKey) {
    console.log("API access not allowed");
    return NextResponse.json({ error: "API access not allowed", status: 500 });
  }

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-nfts",
      },
      {
        status: 200,
      }
    );

  if (!hashList.length || !nftCollectionId) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const jsonHashList = JSON.parse(hashList);
  console.log("jsonHashList", jsonHashList);
  if (!jsonHashList.length) {
    return NextResponse.json(
      { error: "Could not resolve hash list" },
      { status: 500 }
    );
  }

  const response = [];

  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection);
  const mints = jsonHashList.map((address: string) => new PublicKey(address));
  const nftMetasFromMetaplex: any[] = await metaplex
    .nfts()
    .findAllByMintList({ mints });

  if (!nftMetasFromMetaplex.length) {
    console.log("No nfts fetched from metaplex");
    return NextResponse.json(
      { error: "No nfts fetched from metaplex" },
      { status: 500 }
    );
  }

  const nftsWithMetadata = await fetchNftsWithMetadata(
    nftMetasFromMetaplex,
    metaplex
  );

  // await addTraitsToDb(nftsWithMetadata, nftCollectionId);
  // console.log("traits saved");

  for (let nft of nftsWithMetadata) {
    const { mintAddress, imageUrl, symbol, name } = nft;

    try {
      const { tokens }: { tokens: Token[] } = await client.request({
        document: GET_TOKEN_BY_MINT_ADDRESS,
        variables: {
          mintAddress,
        },
      });

      let token = tokens?.[0];

      if (token) {
        console.log(`${token.mintAddress} already exists, skipping`);
        continue;
      }

      if (!token) {
        const { insert_tokens_one }: { insert_tokens_one: Token } =
          await client.request({
            document: ADD_TOKEN,
            variables: {
              decimals: 0,
              imageUrl,
              mintAddress,
              symbol,
              name,
            },
          });

        token = insert_tokens_one;
      }

      response.push(token);
    } catch (error) {
      console.log("```````````FAIL error: ", error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }

  if (!response?.length) {
    return NextResponse.json({
      success: true,
      message: "NFT already exists",
    });
  }

  return NextResponse.json(
    { success: true, message: "NFT added", chatacter: response },
    { status: 200 }
  );
}

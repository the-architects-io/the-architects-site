import axios from "axios";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse } from "@/app/blueprint/types";
import { ADD_TOKENS } from "@/graphql/mutations/add-tokens";
import { Connection } from "@solana/web3.js";
import { Metaplex, PublicKey, TokenWithMint } from "@metaplex-foundation/js";

export type TokenMetadata = {
  image: string;
  decimals: number;
  name: string;
  symbol: string;
};

type Data =
  | TokenMetadata
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

  console.log("trying to get token metadata from helius...");

  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection);

  const tokenMetadata: TokenWithMint[] = await Promise.all(
    mintAddresses.map(async (mintAddress: string) => {
      return await metaplex.tokens().findTokenWithMintByAddress({
        address: new PublicKey(mintAddress),
      });
    })
  );

  console.log("tokenMetadata: ", tokenMetadata);

  const tokens = tokenMetadata
    .filter((token) => !!token?.mint?.address)
    .map((token) => ({
      mintAddress: token.mint.address.toString(),
      name: token?.mint.address.toString() || "",
      decimals: token.mint.decimals,
      symbol: token.mint?.currency?.symbol,
      imageUrl: "",
    }));

  try {
    const { insert_tokens }: { insert_tokens: Data } = await client.request({
      document: ADD_TOKENS,
      variables: {
        tokens,
      },
    });

    return NextResponse.json(insert_tokens, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

import axios from "axios";
import { ADD_TOKEN } from "@/graphql/mutations/add-token";
import { BASE_URL } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse } from "@/app/blueprint/types";
import { handleError } from "@/utils/errors/log-error";

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
  const { mintAddress, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-token",
      },
      { status: 200 }
    );

  if (!mintAddress || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  console.log("trying to get token metadata from helius...");

  const { data: tokenMetadata } = await axios.post(
    `${BASE_URL}/api/get-token-metadata-from-helius`,
    {
      mintAddress,
    }
  );

  if (!tokenMetadata) {
    return NextResponse.json({ error: "Token not found" }, { status: 500 });
  }

  try {
    const { insert_tokens_one }: { insert_tokens_one: Data } =
      await client.request({
        document: ADD_TOKEN,
        variables: {
          mintAddress,
          ...tokenMetadata,
        },
      });

    return NextResponse.json(insert_tokens_one, { status: 200 });
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

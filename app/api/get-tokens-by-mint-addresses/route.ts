import { client } from "@/graphql/backend-client";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";
import { handleError } from "@/utils/errors/log-error";
import { Token } from "@metaplex-foundation/js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { mintAddresses } = await req.json();

  try {
    const { tokens }: { tokens: Token[] } = await client.request({
      document: GET_TOKENS_BY_MINT_ADDRESSES,
      variables: {
        mintAddresses,
      },
    });

    return NextResponse.json(
      {
        tokens,
      },
      { status: 200 }
    );
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      {
        error,
      },
      { status: 500 }
    );
  }
}

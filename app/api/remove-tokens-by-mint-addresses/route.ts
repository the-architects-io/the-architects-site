import { client } from "@/graphql/backend-client";
import { REMOVE_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/mutations/remove-tokens-by-mint-addresses";
import { NextRequest, NextResponse } from "next/server";

type RemoveTokensResponse = {
  affected_rows: number;
  returning: {
    id: string;
    name: string;
  }[];
};

export async function POST(req: NextRequest) {
  const { mintAddresses } = await req.json();

  try {
    const {
      delete_tokens: deletedTokens,
    }: { delete_tokens: RemoveTokensResponse } = await client.request({
      document: REMOVE_TOKENS_BY_MINT_ADDRESSES,
      variables: {
        mintAddresses,
      },
    });

    return NextResponse.json(
      {
        deletedTokens,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error,
      },
      { status: 500 }
    );
  }
}

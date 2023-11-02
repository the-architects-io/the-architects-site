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
  const { mintAddresses, noop } = await req.json();

  if (noop)
    return {
      noop: true,
      endpoint: "remove-tokens-by-mint-addresses",
    };

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
}

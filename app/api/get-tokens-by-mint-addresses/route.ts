import { client } from "@/graphql/backend-client";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";
import { Token } from "@metaplex-foundation/js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { mintAddresses, noop } = await req.json();

  if (noop)
    return {
      noop: true,
      endpoint: "get-token-metadata-from-helius",
    };

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
}

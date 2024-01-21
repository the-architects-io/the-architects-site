import { ARCHITECTS_API_URL } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { REMOVE_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/mutations/remove-tokens-by-mint-addresses";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, metadata } = await req.json();

  console.log({
    message,
    metadata,
  });

  const { data } = await axios.post(`${ARCHITECTS_API_URL}/report-error`, {
    error: message,
    metadata,
  });

  return NextResponse.json(
    {
      data: {},
    },
    { status: 200 }
  );
}

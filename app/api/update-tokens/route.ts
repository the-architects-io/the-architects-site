import { Token } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_TOKENS } from "@the-architects/blueprint-graphql";

import { handleError } from "@/utils/errors/log-error";
import { NextRequest, NextResponse } from "next/server";
import { gql } from "@apollo/client";

const UPDATE_TOKEN = gql`
  mutation UPDATE_TOKEN($id: uuid!, $token: tokens_set_input!) {
    update_tokens(where: { id: { _eq: $id } }, _set: $token) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  const {
    tokens,
    cluster,
  }: {
    tokens: Token[];
    cluster: "devnet" | "mainnet-beta";
  } = await req.json();

  if (!tokens.length) {
    return NextResponse.json({ error: "Invalid args" }, { status: 400 });
  }

  if (cluster) {
    tokens.forEach((token) => {
      token.cluster = cluster;
    });
  }

  let updatedTokens: { affected_rows: number }[] = [];
  try {
    for (const token of tokens) {
      const { update_tokens }: { update_tokens: { affected_rows: number } } =
        await client.request(UPDATE_TOKEN, {
          id: token.id,
          token,
        });
      updatedTokens.push(update_tokens);
    }

    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }
}

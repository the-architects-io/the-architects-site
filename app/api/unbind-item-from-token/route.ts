import { client } from "@/graphql/backend-client";
import { UNBIND_ITEM_FROM_TOKEN } from "@/graphql/mutations/unbind-item-from-token";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse, Token } from "@/app/blueprint/types";

type Data =
  | Token
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { id, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "unbind-item-from-token",
      },
      { status: 200 }
    );

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const { update_items_by_pk: updatedItem }: { update_items_by_pk: Token } =
    await client.request(UNBIND_ITEM_FROM_TOKEN, {
      id,
    });

  if (!updatedItem) {
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedItem, { status: 200 });
}

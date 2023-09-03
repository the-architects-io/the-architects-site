import { client } from "@/graphql/backend-client";
import { BIND_ITEM_TO_TOKEN } from "@/graphql/mutations/bind-item-to-token";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { GET_TOKEN_BY_MINT_ADDRESS } from "@/graphql/queries/get-token-by-mint-address";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import { GET_ITEM_BY_ID } from "@/graphql/queries/get-item-by-id";
import { Item } from "@/app/api/add-item/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse } from "@/app/blueprint/types";

type Data =
  | Token
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { mintAddress, itemId, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "bind-item-to-token",
      },
      { status: 200 }
    );

  if (!itemId || !mintAddress) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const { tokens }: { tokens: Token[] } = await client.request(
    GET_TOKEN_BY_MINT_ADDRESS,
    {
      mintAddress,
    }
  );

  const { items_by_pk: item }: { items_by_pk: Item } = await client.request(
    GET_ITEM_BY_ID,
    {
      id: itemId,
    }
  );

  let token = tokens?.[0];

  console.log({ tokens });

  if (!token) {
    console.log("Token not found, adding it to the database");
    try {
      const { data: newToken }: { data: Token } = await axios.post(
        `${BASE_URL}/api/add-token`,
        { mintAddress }
      );
      token = newToken;
    } catch (error: any) {
      console.error({ error: error?.response?.data?.error?.response });
      console.error({ error: JSON.stringify(error) });
      return NextResponse.json(
        {
          error:
            error?.response?.data?.error?.response ||
            "There was an unexpected error adding the token",
        },
        { status: 500 }
      );
    }
  }

  if (item?.token?.id) {
    return NextResponse.json(
      { error: "Token already bound to an item" },
      { status: 400 }
    );
  }

  const { update_items_by_pk: updatedToken }: { update_items_by_pk: Data } =
    await client.request(BIND_ITEM_TO_TOKEN, {
      tokenId: token?.id,
      itemId,
    });

  if (!updatedToken) {
    return NextResponse.json({ error: "There was an unexpected error" });
  }

  return NextResponse.json(updatedToken);
}

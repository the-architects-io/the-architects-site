import { ADD_ITEM } from "@the-architects/blueprint-graphql";

import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Item, NoopResponse } from "@/app/blueprint/types";
import { handleError } from "@/utils/errors/log-error";

type Data =
  | Item
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const {
    imageUrl,
    isConsumable = false,
    isCraftable = false,
    name,
    categoryId,
    description,
    noop,
  } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-item",
      status: 200,
    });

  if (!name) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const { insert_items_one }: { insert_items_one: Data } =
      await client.request({
        document: ADD_ITEM,
        variables: {
          imageUrl,
          name,
          isConsumable,
          isCraftable,
          itemCategoryId: categoryId,
          description,
        },
      });

    console.log("insert_items_one: ", insert_items_one);

    return NextResponse.json(insert_items_one, { status: 200 });
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

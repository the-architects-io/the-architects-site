// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ADD_ITEM } from "@/graphql/mutations/add-item";
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Item, NoopResponse } from "@/app/blueprint/types";
import { ADD_ITEMS } from "@/graphql/mutations/add-items";

type Data =
  | Item[]
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { items, noop } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-item",
      status: 200,
    });

  if (!items?.length) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const { insert_items: addedItems }: { insert_items: Item[] } =
      await client.request({
        document: ADD_ITEMS,
        variables: {
          items,
        },
      });

    console.log("addedItems: ", addedItems);

    return NextResponse.json(addedItems, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

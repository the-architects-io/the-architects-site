// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ItemCollection, NoopResponse } from "@/app/blueprint/types";
import { ADD_ITEM_COLLECTION } from "@/graphql/mutations/add-item-collection";
import { handleError } from "@/utils/errors/log-error";

type Data =
  | ItemCollection
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { amount, imageUrl, name, itemId, noop } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-item-collection",
      status: 200,
    });

  if (!name) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const {
      insert_itemCollections_one: itemCollection,
    }: { insert_itemCollections_one: Data } = await client.request({
      document: ADD_ITEM_COLLECTION,
      variables: {
        amount,
        imageUrl,
        name,
        itemId,
      },
    });

    console.log("itemCollection: ", itemCollection);

    return NextResponse.json(itemCollection, { status: 200 });
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

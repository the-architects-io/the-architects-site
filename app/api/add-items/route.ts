import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Item } from "@/app/blueprint/types";
import { ADD_ITEMS } from "@/graphql/mutations/add-items";
import { GET_ITEMS_BY_TOKEN_IDS } from "@/graphql/queries/get-items-by-token-ids";

type ItemArg = {
  name: string;
  imageUrl: string;
  tokenId: string;
};

export async function POST(req: NextRequest) {
  const {
    items,
    noop,
  }: {
    items: ItemArg[];
    noop: boolean;
  } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-item",
      status: 200,
    });

  if (!items?.length) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  let itemsInDb: Item[] = [];

  console.log({
    items,
    tokenIds: items.map((item: ItemArg) => item.tokenId),
  });

  try {
    const { items: itemsInDbResponse }: { items: Item[] } =
      await client.request({
        document: GET_ITEMS_BY_TOKEN_IDS,
        variables: {
          ids: items.map((item: ItemArg) => item.tokenId),
        },
      });

    itemsInDb = itemsInDbResponse;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }

  const itemsToAdd = items.filter(
    (item: ItemArg) =>
      !itemsInDb.find(
        (itemInDb: Item) =>
          itemInDb.token.id === item.tokenId && itemInDb.name === item.name
      )
  );

  console.log({
    items,
    itemsToAdd,
    itemsInDb,
  });

  if (!itemsToAdd.length) {
    return NextResponse.json(
      {
        addedItems: [],
        allItems: [...itemsInDb],
      },
      { status: 200 }
    );
  }

  try {
    const {
      insert_items: addedItems,
    }: { insert_items: { returning: Item[]; affected_rows: number } } =
      await client.request({
        document: ADD_ITEMS,
        variables: {
          items: itemsToAdd,
        },
      });

    return NextResponse.json(
      {
        addedItems: addedItems?.returning,
        allItems: [...itemsInDb, ...addedItems?.returning],
      } || [],
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

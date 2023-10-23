// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ItemCollection, NoopResponse } from "@/app/blueprint/types";
import { ADD_ITEM_COLLECTIONS } from "@/graphql/mutations/add-item-collections";

type Data =
  | ItemCollection
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { itemCollections, noop, apiKey } = await req.json();

  if (!process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  const isValidApiKey = process.env.BLUEPRINT_API_KEY === apiKey;

  if (!isValidApiKey) {
    console.log("API access not allowed");
    return NextResponse.json({ error: "API access not allowed", status: 500 });
  }

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-item-collections",
      status: 200,
    });

  if (!itemCollections?.length) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const {
      insert_itemCollections: addedItemCollections,
    }: {
      insert_itemCollections: {
        returning: ItemCollection[];
        affected_rows: number;
      };
    } = await client.request({
      document: ADD_ITEM_COLLECTIONS,
      variables: {
        itemCollections,
      },
    });

    return NextResponse.json(
      { addedItemCollections: addedItemCollections?.returning || [] },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

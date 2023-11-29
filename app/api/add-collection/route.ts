import { client } from "@/graphql/backend-client";
import { ADD_COLLECTION } from "@/graphql/mutations/add-collection";
import { Collection } from "@metaplex-foundation/mpl-token-metadata";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { collection } = await req.json();

  const {
    insert_collections_one,
  }: {
    insert_collections_one: Collection;
  } = await client.request({
    document: ADD_COLLECTION,
    variables: {
      collection,
    },
  });

  return NextResponse.json(
    {
      success: true,
      collection: insert_collections_one,
    },
    {
      status: 200,
    }
  );
}

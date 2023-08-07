import { client } from "@/graphql/backend-client";
import { NoopResponse } from "@/app/api/get-token-metadata-from-helius/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADD_ITEM_REWARD_COLLECTION } from "@/graphql/mutations/add-item-reward-collection";
import { RewardCollection } from "@/app/admin/dispenser/[id]/page";
import { ADD_ITEM_COLLECTION } from "@/graphql/mutations/add-item-collection";
impimport { ItemCollection } from "@/app/blueprint/types";
import { ADD_COST_COLLECTION } from "@/graphql/mutations/add-cost-collection";

type Data =
  | RewardCollection
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { amount, dispenserId, imageUrl, name, itemId, noop } =
    await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-dispenser",
      status: 200,
    });

  if (!name || !dispenserId || !amount) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const {
      insert_itemCollections_one: itemCollection,
    }: { insert_itemCollections_one: ItemCollection } = await client.request({
      document: ADD_ITEM_COLLECTION,
      variables: {
        amount,
        imageUrl,
        name,
        itemId,
      },
    });

    const {
      insert_costCollections_one: costCollection,
    }: { insert_costCollections_one: Data } = await client.request({
      document: ADD_COST_COLLECTION,
      variables: {
        dispenserId,
        name,
        itemCollectionId: itemCollection.id,
      },
    });

    console.log("costCollection: ", costCollection);

    return NextResponse.json(costCollection, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

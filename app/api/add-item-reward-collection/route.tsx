// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/graphql/backend-client";
import { NoopResponse } from "@/app/api/get-token-metadata-from-helius/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADD_ITEM_REWARD_COLLECTION } from "@/graphql/mutations/add-item-reward-collection";
import { RewardCollection } from "@/app/admin/dispenser/[id]/page";
import { ADD_ITEM_COLLECTION } from "@/graphql/mutations/add-item-collection";
impimport { ItemCollection } from "@/app/blueprint/types";

type Data =
  | RewardCollection
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const {
    amount,
    dispenserId,
    isFreezeOnDelivery,
    imageUrl,
    name,
    payoutChance,
    itemId,
    noop,
  } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-dispenser",
      status: 200,
    });

  if (!name || !dispenserId || !payoutChance || !amount) {
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
      insert_rewardCollections_one: rewardCollection,
    }: { insert_rewardCollections_one: Data } = await client.request({
      document: ADD_ITEM_REWARD_COLLECTION,
      variables: {
        dispenserId,
        isFreezeOnDelivery,
        imageUrl,
        name,
        payoutChance,
        itemCollectionId: itemCollection.id,
      },
    });

    console.log("rewardCollection: ", rewardCollection);

    return NextResponse.json(rewardCollection, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

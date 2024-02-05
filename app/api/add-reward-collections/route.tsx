import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse, RewardCollection } from "@/app/blueprint/types";
import { handleError } from "@/utils/errors/log-error";
import {
  GET_REWARD_COLLECTIONS_BY_DISPENSER_ID,
  ADD_REWARD_COLLECTIONS,
} from "@the-architects/blueprint-graphql";

type Data =
  | RewardCollection
  | NoopResponse
  | {
      error: unknown;
    };

type RewardCollectionArgs = {
  name: string;
  dispenserId: string;
  itemCollectionId: string;
  itemId?: string;
};

export async function POST(req: NextRequest) {
  const { rewardCollections, dispenserId, noop } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-dispenser",
      status: 200,
    });

  if (!rewardCollections?.length || !dispenserId) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const {
      rewardCollections: rewardCollectionsInDb,
    }: { rewardCollections: RewardCollection[] } = await client.request({
      document: GET_REWARD_COLLECTIONS_BY_DISPENSER_ID,
      variables: {
        id: dispenserId,
      },
    });

    const rewardCollectionsToInsert = rewardCollections.filter(
      (rewardCollection: RewardCollectionArgs) =>
        !rewardCollectionsInDb.find(
          (rewardCollectionInDb) =>
            rewardCollectionInDb.itemCollection.item.id ===
            rewardCollection.itemId
        )
    );

    rewardCollectionsToInsert.forEach(
      (rewardCollection: RewardCollectionArgs) => {
        delete rewardCollection.itemId;
      }
    );

    const {
      insert_rewardCollections: addedRewardCollections,
    }: { insert_rewardCollections: Data } = await client.request({
      document: ADD_REWARD_COLLECTIONS,
      variables: {
        rewardCollections: rewardCollectionsToInsert,
      },
    });

    console.log("addedRewardCollections: ", addedRewardCollections);

    return NextResponse.json(addedRewardCollections, { status: 200 });
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

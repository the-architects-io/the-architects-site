import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CostCollection,
  NoopResponse,
  RewardCollection,
} from "@/app/blueprint/types";
import { ADD_COST_COLLECTIONS } from "@/graphql/mutations/add-cost-collections";
import { GET_COST_COLLECTIONS_BY_DISPENSER_ID } from "@/graphql/queries/get-cost-collections-by-dispenser-id";

type Data =
  | RewardCollection
  | NoopResponse
  | {
      error: unknown;
    };

type CostCollectionArgs = {
  name: string;
  dispenserId: string;
  itemCollectionId: string;
  itemId?: string;
};

export async function POST(req: NextRequest) {
  const { costCollections, dispenserId, noop } = await req.json();

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-cost-collections",
      status: 200,
    });

  if (!costCollections?.length || !dispenserId) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  try {
    const {
      costCollections: costCollectionsInDb,
    }: { costCollections: CostCollection[] } = await client.request({
      document: GET_COST_COLLECTIONS_BY_DISPENSER_ID,
      variables: {
        id: dispenserId,
      },
    });

    const costCollectionsToInsert = costCollections.filter(
      (costCollection: CostCollectionArgs) =>
        !costCollectionsInDb.find(
          (costCollectionInDb) =>
            costCollectionInDb.itemCollection.item.id === costCollection.itemId
        )
    );

    console.log({
      costCollectionsToInsert,
      costCollectionsInDb,
      costCollectionsInDbItemCollectionItems: costCollectionsInDb.map(
        (costCollectionInDb) => costCollectionInDb.itemCollection.item
      ),
    });

    costCollectionsToInsert.forEach((costCollection: CostCollectionArgs) => {
      delete costCollection.itemId;
    });

    const {
      insert_costCollections: addedCostCollections,
    }: { insert_costCollections: Data } = await client.request({
      document: ADD_COST_COLLECTIONS,
      variables: {
        costCollections: costCollectionsToInsert,
      },
    });

    console.log("addedCostCollections: ", addedCostCollections);

    return NextResponse.json(addedCostCollections, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

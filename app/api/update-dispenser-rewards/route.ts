import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RewardCollection, Token } from "@/app/blueprint/types";
import { UPDATE_DISPENSER_REWARD } from "@/graphql/mutations/update-dispenser-reward";

export async function POST(req: NextRequest) {
  const { rewards, noop, apiKey } = await req.json();

  const isValidApiKey = process.env.BLUEPRINT_API_KEY === apiKey;

  if (!isValidApiKey) {
    console.log("API access not allowed");
    return NextResponse.json({ error: "API access not allowed", status: 500 });
  }

  if (!process.env.API_ACCESS_HOST_LIST) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "update-dispenser-rewards",
      },
      { status: 200 }
    );

  if (!rewards?.length) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  let updatedDispenserRewards: RewardCollection[] = [];
  for (const reward of rewards) {
    if (!reward?.id) {
      return NextResponse.json(
        { error: "Reward is incorrectly formatted" },
        { status: 500 }
      );
    }
    const {
      update_rewardCollections_by_pk: updatedDispenserReward,
    }: { update_rewardCollections_by_pk: any } = await client.request(
      UPDATE_DISPENSER_REWARD,
      {
        id: reward.id,
        payoutSortOrder: reward.payoutSortOrder,
      }
    );

    updatedDispenserRewards.push(updatedDispenserReward);
  }

  if (!updatedDispenserRewards) {
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedDispenserRewards, { status: 200 });
}

import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UPDATE_DISPENSER } from "@the-architects/blueprint-graphql";

import { Dispenser } from "@/app/blueprint/types";

type UpdateDispenserInput = {
  rewardWalletAddress?: string;
  rewardWalletBump?: number;
  cooldownInMs?: number;
};

export async function POST(req: NextRequest) {
  const { id, rewardWalletAddress, rewardWalletBump, cooldownInMs } =
    await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  let setInput: UpdateDispenserInput = {};

  if (rewardWalletAddress) {
    setInput = { ...setInput, rewardWalletAddress };
  }

  if (rewardWalletBump) {
    setInput = { ...setInput, rewardWalletBump };
  }

  if (cooldownInMs) {
    setInput = { ...setInput, cooldownInMs };
  }

  const {
    update_dispensers_by_pk: updatedDispenser,
  }: { update_dispensers_by_pk: Dispenser } = await client.request(
    UPDATE_DISPENSER,
    {
      id,
      setInput,
    }
  );

  console.log({ updatedDispenser });

  if (!updatedDispenser) {
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedDispenser, { status: 200 });
}

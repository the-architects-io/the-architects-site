import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UPDATE_DISPENSER } from "@/graphql/mutations/update-dispenser";
import { Dispenser } from "@/app/blueprint/types";

type UpdateDispenserInput = {
  rewardWalletAddress?: string;
  rewardWalletBump?: number;
  cooldownInMs?: number;
};

export async function POST(req: NextRequest) {
  const {
    id,
    rewardWalletAddress,
    rewardWalletBump,
    cooldownInMs,
    noop,
    apiKey,
  } = await req.json();

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
        endpoint: "update-dispenser",
      },
      { status: 200 }
    );

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

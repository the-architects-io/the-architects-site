import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UNBIND_USER_FROM_WALLET } from "@/graphql/mutations/unbind-user-from-wallet";
import { Wallet } from "@/app/blueprint/types";

export async function POST(req: NextRequest) {
  const { address, noop, apiKey } = await req.json();

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
        endpoint: "unbind-item-from-token",
      },
      { status: 200 }
    );

  if (!address) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const { update_wallets: updatedWallets }: { update_wallets: Wallet } =
    await client.request(UNBIND_USER_FROM_WALLET, {
      address,
    });

  if (!updatedWallets) {
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedWallets, { status: 200 });
}

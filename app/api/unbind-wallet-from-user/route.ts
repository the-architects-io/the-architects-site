import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UNBIND_USER_FROM_WALLET } from "@/graphql/mutations/unbind-user-from-wallet";
import { Wallet } from "@/app/blueprint/types";

export async function POST(req: NextRequest) {
  const { address, noop } = await req.json();

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

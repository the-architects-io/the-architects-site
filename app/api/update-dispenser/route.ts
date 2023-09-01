import { client } from "@/graphql/backend-client";
import { Token } from "@/features/admin/tokens/tokens-list-item";
import { NoopResponse } from "@/app/api/get-token-metadata-from-helius/route";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UNBIND_USER_FROM_WALLET } from "@/graphql/mutations/unbind-user-from-wallet";
import { UPDATE_DISPENSER } from "@/graphql/mutations/update-dispenser";

export async function POST(req: NextRequest) {
  const { id, onChainAddress, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "update-dispenser",
      },
      { status: 200 }
    );

  if (!id || !onChainAddress) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const {
    update_dispensers_by_pk: updatedDispenser,
  }: { update_dispensers_by_pk: Token } = await client.request(
    UPDATE_DISPENSER,
    {
      id,
      setInput: {
        onChainAddress,
      },
    }
  );

  if (!updatedDispenser) {
    return NextResponse.json(
      { error: "There was an unexpected error" },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedDispenser, { status: 200 });
}

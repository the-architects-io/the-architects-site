import { client } from "@/graphql/backend-client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADD_WALLET_WITH_USER,
  BIND_USER_TO_WALLET,
  GET_WALLET_BY_ADDRESS,
} from "@the-architects/blueprint-graphql";
import { NoopResponse, Wallet } from "@/app/blueprint/types";
import { handleError } from "@/utils/errors/log-error";

type Data =
  | Wallet
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest): Promise<NextResponse<Data>> {
  const { userId, walletAddress, noop } = await req.json();

  console.log({ userId, walletAddress, noop });
  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-token",
      },
      { status: 200 }
    );

  if (!walletAddress || !userId) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  try {
    const { wallets }: { wallets: Wallet[] } = await client.request({
      document: GET_WALLET_BY_ADDRESS,
      variables: {
        address: walletAddress,
      },
    });
    if (!wallets?.length) {
      const { insert_wallets_one }: { insert_wallets_one: Wallet } =
        await client.request({
          document: ADD_WALLET_WITH_USER,
          variables: {
            walletAddress,
            userId,
          },
        });
      return NextResponse.json(insert_wallets_one, { status: 200 });
    } else {
      const { update_wallets_by_pk }: { update_wallets_by_pk: Wallet } =
        await client.request({
          document: BIND_USER_TO_WALLET,
          variables: {
            walletId: wallets[0].id,
            userId,
          },
        });
      return NextResponse.json(update_wallets_by_pk, { status: 200 });
    }
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

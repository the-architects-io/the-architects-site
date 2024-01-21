import { client } from "@/graphql/backend-client";
import { ADD_WALLETS } from "@/graphql/mutations/add-wallets";
import { GET_WALLETS_BY_ADDRESSES } from "@/graphql/queries/get-wallets-by-addresses";
import { handleError } from "@/utils/errors/log-error";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { addresses } = await req.json();

  // remove all duplicate wallet addresses from the list without useing Set
  const uniqueAddresses = addresses.filter(
    (value: string, index: number, self: string[]) => {
      return self.indexOf(value) === index;
    }
  );

  try {
    const {
      wallets: existingWallets,
    }: { wallets: { id: string; address: string }[] } = await client.request({
      document: GET_WALLETS_BY_ADDRESSES,
      variables: {
        addresses: uniqueAddresses,
      },
    });

    console.log(existingWallets.length);

    const addressesToInsert =
      uniqueAddresses.filter(
        (address: string) =>
          !existingWallets.find((wallet) => wallet.address === address)
      ) || [];

    console.log({ addressesToInsert });

    const {
      insert_wallets: insertedWallets,
    }: {
      insert_wallets: {
        affected_rows: number;
        returning: { id: string; address: string }[];
      };
    } = await client.request({
      document: ADD_WALLETS,
      variables: {
        wallets: addressesToInsert.map((address: string) => ({ address })),
      },
    });

    console.log({ insertedWallets });

    return NextResponse.json(
      {
        message: "Wallets added successfully",
        existingWalletsCount: existingWallets.length,
        insertedWalletsCount: insertedWallets.affected_rows,
        wallets: [...insertedWallets.returning, ...existingWallets],
      },
      { status: 200 }
    );
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      {
        error: "Error adding wallets",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

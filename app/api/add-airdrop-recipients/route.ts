import { AddWalletsResponse } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { client } from "@/graphql/backend-client";
import { ADD_AIRDROP_RECIPIENTS } from "@/graphql/mutations/add-airdrop-recipients";
import { jsonFileToJson } from "@/utils/files";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const recipientsListFile = formData.get("file") as unknown as File | null;
  const airdropId = formData.get("airdropId");

  if (!recipientsListFile || !airdropId) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const recipientsList: string[] = await jsonFileToJson(recipientsListFile);

  try {
    const { data: addedWallets }: { data: AddWalletsResponse } =
      await axios.post(`${BASE_URL}/api/add-wallets`, {
        addresses: recipientsList,
      });

    const { existingWalletsCount, insertedWalletsCount, wallets } =
      addedWallets;

    // create map where key is address and value is count
    const addressMap = recipientsList.reduce((acc: any, address: string) => {
      if (acc[address]) {
        acc[address] += 1;
      } else {
        acc[address] = 1;
      }
      return acc;
    }, {});

    // create array of objects with address and count
    const addressCountArray = Object.keys(addressMap).map((address) => ({
      address,
      count: addressMap[address],
    }));

    // sort array by count
    const sortedAddressCountArray = addressCountArray.sort(
      (a: any, b: any) => b.count - a.count
    );

    const {
      insert_airdrop_recipients: addedReipients,
    }: { insert_airdrop_recipients: { affected_rows: number } } =
      await client.request({
        document: ADD_AIRDROP_RECIPIENTS,
        variables: {
          recipients: sortedAddressCountArray.map(
            (addressCount: { address: string; count: number }) => ({
              airdropId,
              walletId: wallets.find(
                (wallet: any) => wallet.address === addressCount.address
              )?.id,
              amount: addressCount.count,
            })
          ),
        },
      });

    return NextResponse.json(
      {
        message: "Airdrop recipients added successfully",
        existingWalletsCount,
        insertedWalletsCount,
        addedReipientsCount: addedReipients.affected_rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding recipients:", error);
    return NextResponse.json(
      {
        error: "Error adding recipients",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

import { Airdrop } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import { ADD_AIRDROP } from "@/graphql/mutations/add-airdrop";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, collectionNftId } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { insert_airdrops_one: airdrop }: { insert_airdrops_one: Airdrop } =
      await client.request({
        document: ADD_AIRDROP,
        variables: {
          airdrop: {
            name,
          },
        },
      });

    return NextResponse.json(
      {
        message: "Airdrop added successfully",
        airdrop,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding airdrop:", error);
    return NextResponse.json(
      {
        error: "Error adding airdrop",
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

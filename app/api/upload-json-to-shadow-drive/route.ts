import { RPC_ENDPOINT } from "@/constants/constants";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { ShadowUploadResponse, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { UploadJsonInput } from "@/app/blueprint/types";

export type UploadAssetsToShadowDriveResponse = {
  urls: string[];
  message: string;
  errors: Array<ShadowUploadResponse>;
};

export async function POST(req: NextRequest) {
  const { json, fileName, driveAddress }: UploadJsonInput = await req.json();

  console.log({
    json,
    fileName,
    driveAddress,
  });

  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !driveAddress ||
    !fileName ||
    !json
  ) {
    return NextResponse.json(
      {
        error: "Missing required parameters",
      },
      { status: 500 }
    );
  }

  if (!json) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const wallet = new NodeWallet(keypair);

    // Always use mainnet
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const drive = await new ShdwDrive(connection, wallet).init();

    const buffer = Buffer.from(JSON.stringify({ ...json }));

    const { message, finalized_locations, upload_errors } =
      await drive.uploadFile(new PublicKey(driveAddress), {
        name: fileName,
        file: buffer,
      });

    if (upload_errors.length > 0) {
      return NextResponse.json(
        {
          message,
          errors: upload_errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        url: finalized_locations[0],
        message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      {
        error: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

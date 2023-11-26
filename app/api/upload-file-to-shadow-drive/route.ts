import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { ShadowUploadResponse, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { PublicKey } from "@metaplex-foundation/js";
import { getSlug } from "@/utils/formatting";
import { RPC_ENDPOINT } from "@/constants/constants";

export type UploadAssetsToShadowDriveResponse = {
  urls: string[];
  message: string;
  errors: Array<ShadowUploadResponse>;
};

export async function POST(req: NextRequest) {
  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_ASSET_SHDW_DRIVE_ADDRESS
  ) {
    return NextResponse.json(
      {
        error: "Configuration error",
      },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const formDataFile = formData.get("file") as unknown as File | null;
  const fileName = formData.get("fileName") as string;
  const driveAddress = formData.get("driveAddress") as string;

  if (!formDataFile || !fileName || !driveAddress) {
    return NextResponse.json(null, { status: 400 });
  }

  const file = Buffer.from(await formDataFile.arrayBuffer());

  try {
    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const wallet = new NodeWallet(keypair);

    // Always use mainnet
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const drive = await new ShdwDrive(connection, wallet).init();

    const { upload_errors, finalized_locations, message } =
      await drive.uploadFile(new PublicKey(driveAddress), {
        name: getSlug(fileName),
        file,
      });

    return NextResponse.json(
      {
        errors: upload_errors,
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

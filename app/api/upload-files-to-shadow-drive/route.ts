import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { ShadowFile, ShadowUploadResponse, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { PublicKey } from "@metaplex-foundation/js";
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

  let formDataFiles: ShadowFile[] = [];
  let amountOfFiles = 0;

  while (true) {
    if (formData.get(`file[${amountOfFiles}]`)) {
      amountOfFiles++;
    } else {
      break;
    }
  }

  for (let i = 0; i < amountOfFiles; i++) {
    const file = formData.get(`file[${i}]`) as unknown as File;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const shadowFile = {
      name: file.name,
      file: fileBuffer,
    };
    formDataFiles.push(shadowFile);
  }

  const driveAddress = formData.get("driveAddress") as string;

  if (!formDataFiles || !driveAddress) {
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

    const responses = await drive.uploadMultipleFiles(
      new PublicKey(driveAddress),
      formDataFiles
    );

    return NextResponse.json(
      {
        ...responses,
        count: responses.length,
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

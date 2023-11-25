import { RPC_ENDPOINT } from "@/constants/constants";
import { getRpcEndpoint } from "@/utils/rpc";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { ShdwDrive } from "@shadow-drive/sdk";
import { Connection } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, sizeInKb } = await req.json();

  if (!name || !sizeInKb || Number.isNaN(sizeInKb)) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  if (!process.env.EXECUTION_WALLET_PRIVATE_KEY) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  const umi = await createUmi(getRpcEndpoint())
    .use(mplToolbox())
    .use(mplTokenMetadata());

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
  );

  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  const shadowDrive = await new ShdwDrive(connection, keypair).init();

  const { shdw_bucket, transaction_signature: tx } =
    await shadowDrive.createStorageAccount(name, `${sizeInKb}KB`);

  return NextResponse.json(
    {
      success: true,
      data: {
        driveAddress: shdw_bucket,
        transaction: tx,
      },
    },
    { status: 200 }
  );
}

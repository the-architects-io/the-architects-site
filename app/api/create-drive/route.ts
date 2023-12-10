import { RPC_ENDPOINT } from "@/constants/constants";
import { getRpcEndpoint } from "@/utils/rpc";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, sizeInKb, ownerAddress } = await req.json();

  if (!name || !sizeInKb || Number.isNaN(sizeInKb)) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  if (!process.env.EXECUTION_WALLET_PRIVATE_KEY) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  const privateKeyMap = new Map();

  privateKeyMap.set(
    process.env.NEXT_PUBLIC_EXECUTION_WALLET_ADDRESS,
    bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
  );
  const key = privateKeyMap.get(ownerAddress);

  const keypair = Keypair.fromSecretKey(key);

  const wallet = new NodeWallet(keypair);

  const connection = new Connection(RPC_ENDPOINT, "confirmed"); // always use mainnet
  const shadowDrive = await new ShdwDrive(connection, wallet).init();

  const { shdw_bucket, transaction_signature: tx } =
    await shadowDrive.createStorageAccount(name, `${sizeInKb}KB`);

  return NextResponse.json(
    {
      success: true,
      data: {
        address: shdw_bucket,
        transaction: tx,
      },
    },
    { status: 200 }
  );
}

import { RPC_ENDPOINT } from "@/constants/constants";
import { handleError } from "@/utils/errors/log-error";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { address, ownerAddress } = await req.json();

  if (!address || !ownerAddress) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_EXECUTION_WALLET_ADDRESS
  ) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  try {
    const privateKeyMap = new Map();

    privateKeyMap.set(
      process.env.NEXT_PUBLIC_EXECUTION_WALLET_ADDRESS,
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const wallet = new NodeWallet(
      Keypair.fromSecretKey(privateKeyMap.get(ownerAddress))
    );

    const connection = new Connection(RPC_ENDPOINT, "confirmed"); // always use mainnet
    const drive = await new ShdwDrive(connection, wallet).init();

    const { txid } = await drive.deleteStorageAccount(new PublicKey(address));

    return NextResponse.json(
      {
        success: true,
        transaction: txid,
      },
      { status: 200 }
    );
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      {
        success: false,
        error: error,
      },
      { status: 400 }
    );
  }
}

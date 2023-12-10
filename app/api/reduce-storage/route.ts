import { RPC_ENDPOINT } from "@/constants/constants";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { address, ownerAddress, amountInKb } = await req.json();

  console.log({ address, ownerAddress, amountInKb });
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

    const res = await drive.reduceStorage(
      new PublicKey(address),
      `${amountInKb}KB`
    );

    console.log({ res });

    return NextResponse.json(
      {
        success: true,
        // message,
        // transaction: transaction_signature,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: error,
      },
      { status: 400 }
    );
  }
}

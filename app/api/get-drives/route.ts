import { mapShdwDriveAccountsToBlueprintDriveAccounts } from "@/app/blueprint/utils/mappers/drives";
import { RPC_ENDPOINT } from "@/constants/constants";
import { formatUnixToDateTime } from "@/utils/date-time";
import { handleError } from "@/utils/errors/log-error";
import { getRpcEndpoint } from "@/utils/rpc";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ownerAddress }: { ownerAddress: string } = await req.json();

  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_EXECUTION_WALLET_ADDRESS
  ) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  if (!ownerAddress) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  try {
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

    const drives = await shadowDrive.getStorageAccounts();
    console.log({ drives });

    let accounts: { account: StorageAccountV2; address: string }[] = [];

    for (const drive of drives) {
      accounts.push({
        account: drive.account,
        address: drive.publicKey.toString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        drives: mapShdwDriveAccountsToBlueprintDriveAccounts(accounts),
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

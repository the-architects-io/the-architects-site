import { mapShdwDriveAccountsToBlueprintDriveAccounts } from "@/app/blueprint/utils/mappers/drives";
import { RPC_ENDPOINT } from "@/constants/constants";
import { handleError } from "@/utils/errors/log-error";
import { getBestFittingStorageSizeString } from "@/utils/formatting";
import { getRpcEndpoint } from "@/utils/rpc";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@metaplex-foundation/js";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
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
    const umi = await createUmi(getRpcEndpoint())
      .use(mplToolbox())
      .use(mplTokenMetadata());

    const privateKeyMap = new Map();

    privateKeyMap.set(
      process.env.NEXT_PUBLIC_EXECUTION_WALLET_ADDRESS,
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const key = privateKeyMap.get(ownerAddress);

    const keypair = Keypair.fromSecretKey(key);

    const wallet = new NodeWallet(keypair);

    const connection = new Connection(RPC_ENDPOINT, "confirmed"); // always use mainnet
    const drive = await new ShdwDrive(connection, wallet).init();

    // @ts-ignore
    const account: StorageAccountV2 = await drive.getStorageAccount(
      new PublicKey(address)
    ); // returns `account` not `{ account, publicKey }`

    const accountInfo = await drive.getStorageAccountInfo(
      new PublicKey(address)
    );

    const {
      reserved_bytes: reservedBytes,
      current_usage: currentUsage,
      version,
    } = accountInfo;

    console.log({
      account,
      accountInfo,
    });

    const { keys } = await drive.listObjects(new PublicKey(address));

    return NextResponse.json(
      {
        success: true,
        drive: {
          account: mapShdwDriveAccountsToBlueprintDriveAccounts([
            {
              account,
              address,
            },
          ])?.[0],
          files: keys,
          address,
          name: account.identifier,
          storage: {
            total: getBestFittingStorageSizeString(reservedBytes),
            used: getBestFittingStorageSizeString(currentUsage),
            free: getBestFittingStorageSizeString(reservedBytes - currentUsage),
            percentUsed: ((currentUsage / reservedBytes) * 100).toFixed(2),
            percentFree: (
              ((reservedBytes - currentUsage) / reservedBytes) *
              100
            ).toFixed(2),
            bytes: {
              total: reservedBytes,
              used: currentUsage,
              free: reservedBytes - currentUsage,
            },
          },
        },
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

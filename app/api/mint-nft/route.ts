import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { ShadowUploadResponse, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair, TransactionSignature } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import {
  KeypairSigner,
  RpcConfirmTransactionResult,
  Umi,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { getRpcEndpoint } from "@/utils/rpc";

export type UploadAssetsToShadowDriveResponse = {
  urls: string[];
  message: string;
  errors: Array<ShadowUploadResponse>;
};

export async function POST(req: NextRequest) {
  const { name, uri, sellerFeeBasisPoints, isCollection, creatorAddress } =
    await req.json();

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

  if (
    !name ||
    !uri ||
    sellerFeeBasisPoints === undefined ||
    isNaN(sellerFeeBasisPoints)
  ) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    let mintRes: {
      signature: TransactionSignature;
      result: RpcConfirmTransactionResult;
      address: string;
    } | null = null;

    const umi = await createUmi(getRpcEndpoint())
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi());

    const keypair = umi.eddsa.createKeypairFromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    umi.use(keypairIdentity(keypair));

    const collectionMint = generateSigner(umi);

    console.log({
      name,
      uri,
      collectionMint,
      creatorAddress,
      isCollection,
      sellerFeeBasisPoints,
    });

    const { signature, result } = await createNft(umi, {
      mint: collectionMint,
      name,
      uri,
      sellerFeeBasisPoints: percentAmount(sellerFeeBasisPoints),
      isCollection,
    }).sendAndConfirm(umi);

    mintRes = {
      signature: signature.toString(),
      result,
      address: collectionMint.publicKey.toString(),
    };

    return NextResponse.json(
      {
        ...mintRes,
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

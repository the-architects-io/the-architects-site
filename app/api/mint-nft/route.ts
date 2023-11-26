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
import { getRpcEndpoint, isValidCluster } from "@/utils/rpc";
import { PublicKey } from "@metaplex-foundation/js";

export type UploadAssetsToShadowDriveResponse = {
  urls: string[];
  message: string;
  errors: Array<ShadowUploadResponse>;
};

export async function POST(req: NextRequest) {
  const {
    name,
    uri,
    sellerFeeBasisPoints,
    isCollection,
    creatorAddress,
    cluster,
  } = await req.json();

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

  if (!isValidCluster(cluster)) {
    return NextResponse.json(
      {
        error: "Invalid cluster",
      },
      { status: 400 }
    );
  }

  try {
    let mintRes: {
      signature: TransactionSignature;
      result: RpcConfirmTransactionResult;
      mintAddress: string;
    } | null = null;

    const umi = await createUmi(getRpcEndpoint(cluster))
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi());

    const keypair = umi.eddsa.createKeypairFromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    umi.use(keypairIdentity(keypair));

    const collectionMint = generateSigner(umi);

    const { signature, result } = await createNft(umi, {
      mint: collectionMint,
      name,
      uri,
      sellerFeeBasisPoints,
      isCollection,
    }).sendAndConfirm(umi);

    // convert Uint8Array signature to public key string
    const signaturePublicKey = new TextDecoder().decode(
      new Uint8Array(signature)
    );

    return NextResponse.json(
      {
        signature: signaturePublicKey,
        result,
        mintAddress: collectionMint.publicKey.toString(),
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

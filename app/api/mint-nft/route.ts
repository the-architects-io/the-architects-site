import { RPC_ENDPOINT } from "@/constants/constants";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { ShadowUploadResponse, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair, TransactionSignature } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import {
  KeypairSigner,
  RpcConfirmTransactionResult,
  Umi,
  generateSigner,
  keypairIdentity,
  none,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";

export type UploadAssetsToShadowDriveResponse = {
  urls: string[];
  message: string;
  errors: Array<ShadowUploadResponse>;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const { name, uri, sellerFeeBasisPoints, isCollection } = await req.json();

  if (
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !process.env.ASSET_SHDW_DRIVE_ADDRESS
  ) {
    return NextResponse.json(
      {
        error: "Configuration error",
      },
      { status: 500 }
    );
  }

  console.log(1);

  if (
    !name ||
    !uri ||
    sellerFeeBasisPoints === undefined ||
    isNaN(sellerFeeBasisPoints)
  ) {
    return NextResponse.json(null, { status: 400 });
  }

  console.log(2);

  try {
    let mintRes: {
      signature: TransactionSignature;
      result: RpcConfirmTransactionResult;
      address: string;
    } | null = null;

    console.log(3);

    const umi = await createUmi(RPC_ENDPOINT)
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi());

    console.log(4);

    const keypair = umi.eddsa.createKeypairFromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    console.log(5);

    umi.use(keypairIdentity(keypair));

    console.log(6);

    const collectionMint = generateSigner(umi);

    console.log(7);
    const { signature, result } = await createNft(umi, {
      mint: collectionMint,
      name,
      uri,
      sellerFeeBasisPoints: percentAmount(sellerFeeBasisPoints),
      isCollection,
    }).sendAndConfirm(umi);

    console.log(8);

    mintRes = {
      signature: signature.toString(),
      result,
      address: collectionMint.publicKey.toString(),
    };

    console.log(9);

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

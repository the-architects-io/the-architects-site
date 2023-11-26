import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { TransactionSignature } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import {
  RpcConfirmTransactionResult,
  createSignerFromKeypair,
  keypairIdentity,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { getRpcEndpoint } from "@/utils/rpc";
import { mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum";

export async function POST(req: NextRequest) {
  const {
    merkleTreeAddress,
    collectionNftAddress,
    creatorAddress,
    sellerFeeBasisPoints,
    name,
    uri,
    leafOwnerAddress,
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
    isNaN(sellerFeeBasisPoints) ||
    !merkleTreeAddress ||
    !collectionNftAddress ||
    !creatorAddress ||
    !leafOwnerAddress
  ) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const umi = await createUmi(getRpcEndpoint(cluster))
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi());

    const keypair = umi.eddsa.createKeypairFromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    umi.use(keypairIdentity(keypair));
    umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

    const { signature, result } = await mintToCollectionV1(umi, {
      leafOwner: publicKey(leafOwnerAddress),
      merkleTree: publicKey(merkleTreeAddress),
      collectionMint: publicKey(collectionNftAddress),
      metadata: {
        name,
        uri,
        sellerFeeBasisPoints,
        collection: { key: publicKey(collectionNftAddress), verified: false },
        creators: [
          {
            address: publicKey(creatorAddress),
            verified: false,
            share: 100,
          },
        ],
      },
    }).sendAndConfirm(umi);

    return NextResponse.json(
      {
        signature: signature.toString(),
        result,
        collectionAddress: collectionNftAddress,
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

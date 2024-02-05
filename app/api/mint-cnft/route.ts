import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair, TransactionSignature } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import {
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
import { mintToCollectionV1, mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { Creator, MerkleTree } from "@/app/blueprint/types";
import { client } from "@/graphql/backend-client";
import {
  GET_MERKLE_TREE_BY_ADDRESS,
  UPDATE_MERKLE_TREE,
} from "@the-architects/blueprint-graphql";
import { handleError } from "@/utils/errors/log-error";

const isValidCreatorsArray = (creators: any): boolean => {
  if (!Array.isArray(creators)) {
    return false;
  }

  if (creators?.length === 0) {
    return false;
  }

  if (
    creators?.some(
      (creator) =>
        !creator.address ||
        !creator.share ||
        isNaN(creator.share) ||
        creator.share < 0 ||
        creator.share > 100
    )
  ) {
    return false;
  }

  return true;
};

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
    creators,
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

    console.log("1");

    let formattedCreators = [
      {
        address: publicKey(creatorAddress),
        verified: false,
        share: 100,
      },
    ];

    const mintConfig = {
      leafOwner: publicKey(leafOwnerAddress),
      merkleTree: publicKey(merkleTreeAddress),
      metadata: {
        name,
        uri,
        sellerFeeBasisPoints,
        creators: formattedCreators,
      },
    };

    const { merkleTrees }: { merkleTrees: MerkleTree[] } = await client.request(
      GET_MERKLE_TREE_BY_ADDRESS,
      {
        address: merkleTreeAddress,
      }
    );
    const tree = merkleTrees?.[0];

    console.log({ tree });

    if (!tree) {
      return NextResponse.json(
        {
          error: "Merkle tree not found in database",
        },
        { status: 500 }
      );
    }

    if (!!collectionNftAddress) {
      const { signature, result } = await mintToCollectionV1(umi, {
        ...mintConfig,
        collectionMint: publicKey(collectionNftAddress),
        metadata: {
          ...mintConfig.metadata,
          collection: { key: publicKey(collectionNftAddress), verified: false },
        },
      }).sendAndConfirm(umi);

      await client.request(UPDATE_MERKLE_TREE, {
        id: tree.id,
        merkleTree: {
          currentCapacity: tree.currentCapacity
            ? tree.currentCapacity
            : tree.maxCapacity - 1,
        },
      });

      return NextResponse.json(
        {
          signature: signature.toString(),
          result,
          collectionAddress: collectionNftAddress,
        },
        { status: 200 }
      );
    } else {
      console.log("3b");
      const { signature, result } = await mintV1(umi, {
        ...mintConfig,
        metadata: {
          ...mintConfig.metadata,
          collection: {
            key: publicKey(Keypair.generate().publicKey),
            verified: false,
          },
        },
      }).sendAndConfirm(umi);

      await client.request(UPDATE_MERKLE_TREE, {
        id: tree.id,
        merkleTree: {
          currentCapacity: tree.currentCapacity
            ? tree.currentCapacity - 1
            : tree.maxCapacity - 1,
        },
      });

      return NextResponse.json(
        {
          signature: signature.toString(),
          result,
          collectionAddress: collectionNftAddress,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    handleError(error as Error);
    return NextResponse.json(
      {
        error: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

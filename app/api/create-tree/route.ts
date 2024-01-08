import { MerkleTree } from "@/app/blueprint/types";
import { getMaxCapacityFromMaxBufferSizeAndMaxDepth } from "@/app/blueprint/utils/merkle-trees";
import { client } from "@/graphql/backend-client";
import { ADD_MERKLE_TREE } from "@/graphql/mutations/add-merkle-tree";
import { UPDATE_COLLECTION } from "@/graphql/mutations/update-collection";
import { getRpcEndpoint } from "@/utils/rpc";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import {
  Collection,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { maxDepth, maxBufferSize, collectionId, cluster, userId } =
    await req.json();

  if (
    !maxDepth ||
    !maxBufferSize ||
    Number.isNaN(maxDepth) ||
    Number.isNaN(maxBufferSize)
  ) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  if (!process.env.EXECUTION_WALLET_PRIVATE_KEY) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  const umi = await createUmi(getRpcEndpoint(cluster))
    .use(mplToolbox())
    .use(mplTokenMetadata());

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
  );

  umi.use(keypairIdentity(keypair));

  const merkleTree = generateSigner(umi);
  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: Number(maxDepth),
    maxBufferSize: Number(maxBufferSize),
  });

  const merkleTreeAddress = merkleTree.publicKey.toString();

  const tree = {
    address: merkleTreeAddress,
    maxDepth: Number(maxDepth),
    maxBufferSize: Number(maxBufferSize),
    cluster,
  };

  console.log("tree", tree);

  const capacity = getMaxCapacityFromMaxBufferSizeAndMaxDepth(
    Number(maxBufferSize),
    Number(maxDepth)
  );

  const { insert_merkle_trees_one }: { insert_merkle_trees_one: MerkleTree } =
    await client.request(ADD_MERKLE_TREE, {
      tree: {
        ...tree,
        ...(userId && { userId }),
        maxCapacity: capacity,
        currentCapacity: capacity,
      },
    });

  if (collectionId) {
    const {
      update_collections_by_pk,
    }: { update_collections_by_pk: Collection } = await client.request(
      UPDATE_COLLECTION,
      {
        id: collectionId,
        collection: {
          merkleTreeId: insert_merkle_trees_one.id,
        },
      }
    );
  }

  await builder.sendAndConfirm(umi);

  return NextResponse.json(
    {
      success: true,
      merkleTreeAddress,
    },
    { status: 200 }
  );
}

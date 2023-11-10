import { getRpcEndpoint } from "@/utils/rpc";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { maxDepth, maxBufferSize } = await req.json();

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

  const umi = await createUmi(getRpcEndpoint())
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

  await builder.sendAndConfirm(umi);

  return NextResponse.json(
    {
      success: true,
      merkleTreeAddress: merkleTree.publicKey.toString(),
    },
    { status: 200 }
  );
}

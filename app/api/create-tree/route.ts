import { RPC_ENDPOINT_DEVNET } from "@/constants/constants";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {
  generateSigner,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { createSignerFromKeypair } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Keypair } from "@solana/web3.js";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (!process.env.EXECUTION_WALLET_PRIVATE_KEY) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 });
  }

  const umi = await createUmi(RPC_ENDPOINT_DEVNET)
    .use(mplToolbox())
    .use(mplTokenMetadata());

  const keypair = umi.eddsa.createKeypairFromSecretKey(
    bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
  );

  umi.use(keypairIdentity(keypair));

  const builder = await createTree(umi, {
    merkleTree: generateSigner(umi),
    maxDepth: 14,
    maxBufferSize: 64,
  });

  await builder.sendAndConfirm(umi);

  return NextResponse.json(
    {
      success: true,
      merkleTreeAddress: keypair.publicKey.toString(),
    },
    { status: 200 }
  );
}

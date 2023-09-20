import { TokenType } from "@/app/blueprint/types";
import { getUmiClient } from "@/utils/umi";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  createFungible,
  createFungibleAsset,
  createNft,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFileFromJson,
  createNoopSigner,
  createSignerFromKeypair,
  generateSigner,
  generatedSignerPayer,
  isKeypairSigner,
  isSigner,
  keypairIdentity,
  percentAmount,
  signerIdentity,
  signerPayer,
} from "@metaplex-foundation/umi";
import { Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    noop,
    image,
    description,
    name,
    sellerFeeBasisPoints = 8.0,
    tokenType = TokenType.NFT,
  } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "unbind-item-from-token",
      },
      { status: 200 }
    );

  if (
    !image ||
    !description ||
    !name ||
    !process.env.EXECUTION_WALLET_PRIVATE_KEY
  ) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  try {
    // let createToken = null;
    // switch (tokenType) {
    //   case TokenType.NFT:
    //     createToken = createNft;
    //     break;
    //   case TokenType.SFT:
    //     createToken = createFungibleAsset;
    //     break;
    //   case TokenType.SPL:
    //     createToken = createFungible;
    //   default:
    //     return NextResponse.json(
    //       { error: "Invalid token type" },
    //       { status: 500 }
    //     );
    // }

    const umi = await getUmiClient();
    const mint = generateSigner(umi);
    const uris = await umi.uploader.uploadJson({
      name,
      description,
      image,
      seller_fee_basis_points: sellerFeeBasisPoints * 100,
    });
    if (!uris || uris.length === 0) {
      return NextResponse.json({
        status: 500,
        error: "Error uploading file",
      });
    }
    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    // @ts-ignore
    const signer = createSignerFromKeypair(umi, keypair);
    umi.use(keypairIdentity(signer));

    const { signature, result } = await createNft(umi, {
      mint: signer,
      name,
      uri: uris[0],
      sellerFeeBasisPoints: percentAmount(sellerFeeBasisPoints),
      payer: signer,
    }).sendAndConfirm(umi);

    const asset = await fetchDigitalAsset(umi, mint.publicKey);

    // console.log(JSON.stringify({ signature, result }, null, 2));

    return NextResponse.json(
      {
        // signature,
        // result,
        // asset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log({ error });
    return {
      status: 500,
      json: {
        error: "Error minting token",
      },
    };
  }
}

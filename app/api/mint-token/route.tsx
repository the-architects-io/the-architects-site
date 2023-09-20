import { parse, stringify } from "lossless-json";
import { TokenType } from "@/app/blueprint/types";
import { RPC_ENDPOINT } from "@/constants/constants";
import { getUmiClient } from "@/utils/umi";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
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
  percentAmount,
  publicKey,
  signerIdentity,
  signerPayer,
} from "@metaplex-foundation/umi";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

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

  if (!description || !name || !process.env.EXECUTION_WALLET_PRIVATE_KEY) {
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

    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);
    const umi = await getUmiClient();

    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const wallet = new NodeWallet(keypair);
    metaplex.use(keypairIdentity(keypair));

    // console.log({ data });

    // const image = data;

    const uri = await umi.uploader.uploadJson({
      name,
      description,
      image:
        image ||
        "https://the-architects.io/_next/image?url=%2Fimages%2Farchitects-logo.webp&w=640&q=75",
      seller_fee_basis_points: sellerFeeBasisPoints * 100,
    });
    console.log({ uri });
    if (!uri || uri.length === 0) {
      return NextResponse.json({
        status: 500,
        error: "Error uploading file",
      });
    }
    const transactionBuilder = await metaplex.nfts().builders().create({
      uri: uri,
      name,
      sellerFeeBasisPoints: 500, // Represents 5.00%.
    });

    // Get the data that you don't know in advance from getContext()
    const { mintAddress } = transactionBuilder.getContext();

    // Submit the tx
    const { signature, confirmResponse } = await metaplex
      .rpc()
      .sendAndConfirmTransaction(transactionBuilder, {
        commitment: "finalized",
      });

    console.log({ signature });

    let asset;
    try {
      asset = await fetchDigitalAsset(umi, publicKey(mintAddress));
    } catch (error) {
      console.log({ error });
    }

    // console.log(JSON.stringify({ signature, result }, null, 2));
    console.log({ asset });

    return NextResponse.json(
      {
        // signature,
        // result,
        // signature: response?.signature || "",
        // nft,
        asset: parse(stringify(asset) || ""),
        signature,
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

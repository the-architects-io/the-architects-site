import { parse, stringify } from "lossless-json";
import { getUmiClient } from "@/utils/umi";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Metaplex, PublicKey, keypairIdentity } from "@metaplex-foundation/js";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFileFromBrowserFile,
  publicKey,
} from "@metaplex-foundation/umi";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { getRpcEndpoint } from "@/utils/rpc";

export async function POST(req: NextRequest) {
  const res = await req.formData();
  const description = res.get("description") as string;
  const name = res.get("name") as string;
  const sellerFeeBasisPoints = res.get("sellerFeeBasisPoints") as string;
  const noop = res.get("noop");
  const tokenOwner = res.get("tokenOwner") as string;
  const imageFile = res.get("imageFile") as File;

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
    const connection = new Connection(getRpcEndpoint());
    const metaplex = Metaplex.make(connection);
    const umi = await getUmiClient();

    const keypair = Keypair.fromSecretKey(
      bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    );

    const wallet = new NodeWallet(keypair);
    metaplex.use(keypairIdentity(keypair));

    let image;

    if (imageFile) {
      const genericImageFile = await createGenericFileFromBrowserFile(
        imageFile
      );
      const [imageUri] = await umi.uploader.upload([genericImageFile]);
      image = imageUri;
    }

    const uri = await umi.uploader.uploadJson({
      name,
      description,
      image,
      seller_fee_basis_points: Number(sellerFeeBasisPoints) * 100,
    });

    if (!uri || uri.length === 0) {
      return NextResponse.json({
        status: 500,
        error: "Error uploading file",
      });
    }

    let createNftInput = {
      uri,
      name,
      sellerFeeBasisPoints: Number(sellerFeeBasisPoints) * 100,
    };

    if (tokenOwner) {
      createNftInput = {
        ...createNftInput,
        //  @ts-ignore
        tokenOwner: new PublicKey(tokenOwner),
      };
    }

    const transactionBuilder = await metaplex
      .nfts()
      .builders()
      .create(createNftInput);

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

    return NextResponse.json(
      {
        asset: parse(stringify(asset) || ""),
        signature,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log({ error });
    return NextResponse.json(
      {
        error: error?.message,
      },
      { status: 500 }
    );
  }
}

import { RPC_ENDPOINT } from "@/constants/constants";
import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";
import { Helius } from "helius-sdk";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { collectionAddress, creatorAddress, noop } = await req.json();

  if (noop)
    return NextResponse.json(
      {
        noop: true,
        endpoint: "get-nfts-by-collection-mint-address",
      },
      { status: 200 }
    );

  if (!collectionAddress || !creatorAddress || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const helius = new Helius(process.env.HELIUS_API_KEY);
  const response = await helius.rpc.getAssetsByGroup({
    groupKey: "collection",
    groupValue: collectionAddress,
    page: 1,
  });
  console.log(response.items);

  return NextResponse.json(
    {
      data: response.items,
    },
    { status: 200 }
  );

  // const connection = new Connection(RPC_ENDPOINT);
  // const metaplex = Metaplex.make(connection);
  // console.log({
  //   creatorAddress,
  //   collectionAddress,
  // });
  // const nftsByCreator = await metaplex.nfts().findAllByCreator({
  //   creator: new PublicKey(creatorAddress),
  //   position: 2,
  // });
  // debugger;
  // const collectionNft = await metaplex.nfts().findByMint({
  //   mintAddress: new PublicKey(collectionAddress),
  // });
  // debugger;
}

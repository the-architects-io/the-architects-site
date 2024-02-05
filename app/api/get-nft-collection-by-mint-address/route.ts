import { NftCollection } from "@/features/admin/nft-collections/nfts-collection-list-item";
import { client } from "@/graphql/backend-client";
import { GET_NFT_COLLECTION_BY_MINT_ADDRESS } from "@the-architects/blueprint-graphql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const { mintAddress } = await req.json();

  const { nftCollections }: { nftCollections: NftCollection[] } =
    await client.request({
      document: GET_NFT_COLLECTION_BY_MINT_ADDRESS,
      variables: {
        mintAddress,
      },
    });

  if (nftCollections?.length === 0) {
    return NextResponse.json(
      { error: "No NFT collection found" },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      nftCollection: nftCollections[0],
    },
    { status: 200 }
  );
}

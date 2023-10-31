import { NftCollection } from "@/features/admin/nft-collections/nfts-collection-list-item";
import { client } from "@/graphql/backend-client";
import { ADD_NFT_COLLECTION } from "@/graphql/mutations/add-nft-collection";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, noop, symbol, mintAddress, imageUrl } = await req.json();

  if (noop) {
    return NextResponse.json(
      {
        noop: true,
        endpoint: "add-nft-collection",
      },
      {
        status: 200,
      }
    );
  }

  const {
    insert_nftCollections_one,
  }: {
    insert_nftCollections_one: NftCollection;
  } = await client.request({
    document: ADD_NFT_COLLECTION,
    variables: {
      nftCollection: {
        name,
        symbol,
        mintAddress,
        imageUrl,
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      nftCollection: insert_nftCollections_one,
    },
    {
      status: 200,
    }
  );
}

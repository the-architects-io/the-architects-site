import { getUmiClient } from "@/utils/umi";
import { safeFetchMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { Helius } from "helius-sdk";
import { Metadata } from "next";
import { NextRequest, NextResponse } from "next/server";
import {
  createNft,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import secureJson from "secure-json-parse";
import axios from "axios";
import { getRpcEndpoint } from "@/utils/rpc";

export async function POST(req: NextRequest) {
  const { collectionAddress, cluster } = await req.json();

  if (!collectionAddress || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const helius = new Helius(process.env.HELIUS_API_KEY);

  const umi = await getUmiClient(getRpcEndpoint(cluster));
  // const collectionNft = await umi.rpc.getAccount(publicKey(collectionAddress));
  const { metadata } = await fetchDigitalAsset(umi, collectionAddress);

  if (!metadata) {
    return NextResponse.json(
      { error: "Collection not found" },
      { status: 500 }
    );
  }

  const { publicKey, uri } = metadata;

  console.log(publicKey);

  const { data: offChainMetadata } = await axios.get(uri);

  // then fetch collection from helius
  const { items } = await helius.rpc.getAssetsByGroup({
    groupKey: "collection",
    groupValue: collectionAddress,
    page: 1,
  });

  if (!items?.length) {
    return NextResponse.json(
      { error: "Collection not found" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ...offChainMetadata,
      mintAddress: collectionAddress,
    },
    { status: 200 }
  );
}

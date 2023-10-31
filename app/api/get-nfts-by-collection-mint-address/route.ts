import { Helius } from "helius-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { collectionAddress } = await req.json();

  if (!collectionAddress || !process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "Required fields not set" },
      { status: 500 }
    );
  }

  const helius = new Helius(process.env.HELIUS_API_KEY);
  let page = 1;
  let hasNextPage = true;

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();

  // Start the response with a ReadableStream
  const response = new Response(readable, {
    headers: { "Content-Type": "application/json" },
  });

  const writer = writable.getWriter();

  const fetchAndSend = async () => {
    while (hasNextPage) {
      const response = await helius.rpc.getAssetsByGroup({
        groupKey: "collection",
        groupValue: collectionAddress,
        page,
      });

      if (response.items && response.items.length) {
        const chunk = encoder.encode(JSON.stringify(response.items));
        await writer.write(chunk);
        page++;
      } else {
        hasNextPage = false;
        writer.close();
      }
    }
  };

  fetchAndSend();

  return response;
}

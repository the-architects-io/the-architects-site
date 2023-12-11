import { RPC_ENDPOINT } from "@/constants/constants";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@metaplex-foundation/js";
import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { NextRequest } from "next/server";

function iteratorToStream(iterator: AsyncGenerator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* makeUploadIterator(
  file: File,
  driveAddress: string,
  overwrite: boolean,
  ownerAddress: string
) {
  if (!process.env.EXECUTION_WALLET_PRIVATE_KEY) {
    return new Response("Incorrect config", { status: 500 });
  }
  // Acknowledge the receipt to the client
  // yield new TextEncoder().encode("Received hashlist. Starting processing...\n");

  const privateKeyMap = new Map();

  privateKeyMap.set(
    process.env.NEXT_PUBLIC_EXECUTION_WALLET_ADDRESS,
    bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
  );

  const wallet = new NodeWallet(
    Keypair.fromSecretKey(privateKeyMap.get(ownerAddress))
  );

  const connection = new Connection(RPC_ENDPOINT, "confirmed"); // always use mainnet
  const drive = await new ShdwDrive(connection, wallet).init();

  const { message, finalized_locations } = await drive.uploadFile(
    new PublicKey(driveAddress),
    {
      name: file.name,
      file: Buffer.from(await file.arrayBuffer()),
    }
  );

  console.log({ message, finalized_locations });

  yield new TextEncoder().encode("Processing complete.\n");
  yield new TextEncoder().encode(
    JSON.stringify({ message, finalized_locations })
  );
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  let formDataFiles: ShadowFile[] = [];

  const file = formData.get("file") as unknown as File | null;
  const ownerAddress = formData.get("ownerAddress") as string;
  const overwrite = formData.get("overwrite") === "true";
  const driveAddress = formData.get("driveAddress") as string;

  if (!file || !ownerAddress || !driveAddress) {
    return new Response("Invalid params", { status: 400 });
  }

  const iterator = makeUploadIterator(
    file,
    driveAddress,
    overwrite,
    ownerAddress
  );

  const stream = iteratorToStream(iterator);

  return new Response(stream);
}

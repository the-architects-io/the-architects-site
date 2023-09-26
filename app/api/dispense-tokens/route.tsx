// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as anchor from "@coral-xyz/anchor";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Connection, Keypair } from "@solana/web3.js";
import {
  DISPENSER_PROGRAM_ID,
  ENV,
  RPC_ENDPOINT,
  RPC_ENDPOINT_DEVNET,
} from "@/constants/constants";
import { IDL } from "@/idl/types/dispenser";
import { createHash } from "@/utils/hashing";
import { PublicKey } from "@metaplex-foundation/js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { sendTransaction } from "@/utils/transactions/send-transaction";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

export async function POST(req: Request) {
  const { noop, dispenserId, recipientAddress, mintAddress, amount, apiKey } =
    await req.json();

  if (!process.env.API_ACCESS_HOST_LIST || !process.env.API_ACCESS_IP_LIST) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  const hostWhitelist = process.env.API_ACCESS_HOST_LIST;
  const host = req.headers.get("x-forwarded-host") || "";
  const isValidHost = hostWhitelist.indexOf(host) > -1;

  console.log("/api/dispense-tokens", {});

  if (ENV !== "local" && !isValidHost) {
    return NextResponse.json(
      {
        error: `API access not allowed for host: ${host}`,
        status: 500,
      },
      { status: 500 }
    );
  }

  if (apiKey !== process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "Invalid API key",
        status: 500,
      },
      { status: 500 }
    );
  }

  console.log(1);

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-dispenser",
      status: 200,
    });

  console.log(2);

  if (
    !dispenserId ||
    !DISPENSER_PROGRAM_ID ||
    !process.env.AUTHORITY_SEED ||
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !recipientAddress ||
    !mintAddress ||
    !amount
  ) {
    return NextResponse.json(
      { error: "Required fields not set", status: 500 },
      { status: 500 }
    );
  }

  console.log(3);

  const hash = createHash(dispenserId);

  const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from(hash), Buffer.from(process.env.AUTHORITY_SEED)],
    new PublicKey(DISPENSER_PROGRAM_ID)
  );

  console.log(4);

  const rewardKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
  );

  console.log(5);

  const anchorWallet = new NodeWallet(rewardKeypair);
  const connection = new Connection(RPC_ENDPOINT_DEVNET, "confirmed");

  console.log(6);

  const feeCalculator = await connection.getRecentBlockhash();
  const feeInLamports = feeCalculator.feeCalculator.lamportsPerSignature;
  const feeInLamportsWithPadding = feeInLamports + 1000;

  console.log(7);

  const provider = new anchor.AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "confirmed",
  });
  anchor.setProvider(provider);

  if (!provider) throw new Error("No provider");

  const program = new anchor.Program(
    IDL,
    new PublicKey(DISPENSER_PROGRAM_ID),
    provider
  );

  const recipient = new PublicKey(recipientAddress);
  const mint = new PublicKey(mintAddress);

  let txHash;

  try {
    const fromTokenAccount = await getAssociatedTokenAddress(
      mint,
      dispenserPda,
      true
    );

    const toTokenAccount = await getAssociatedTokenAddress(mint, recipient);
    const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);

    const transaction = new anchor.web3.Transaction();

    if (!toTokenAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          provider.wallet.publicKey,
          toTokenAccount,
          recipient,
          mint
        )
      );
    }

    const ix = await program.methods
      .dispenseTokens(
        Buffer.from(hash),
        Buffer.from(process.env.AUTHORITY_SEED),
        bump,
        new anchor.BN(amount)
      )
      .accounts({
        sender: fromTokenAccount,
        recipient: toTokenAccount,
        dispenserPda,
        mint,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    transaction.add(ix);

    txHash = await sendTransaction(transaction, provider, connection);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          apiError: error,
          txError: txHash,
        },
      },
      { status: 500 }
    );
  }

  try {
    return NextResponse.json(
      {
        txHash,
        mintAddress,
        amount,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

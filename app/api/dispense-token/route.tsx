// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import * as anchor from "@coral-xyz/anchor";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NoopResponse } from "@/app/blueprint/types";
import { Connection, Keypair } from "@solana/web3.js";
import { DISPENSER_PROGRAM_ID, RPC_ENDPOINT } from "@/constants/constants";
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

type Data =
  | any
  | NoopResponse
  | {
      error: unknown;
    };

export async function POST(req: NextRequest) {
  const { noop, dispenserId, recipientAddress, mintAddress, amount } =
    await req.json();

  console.log({
    ip: req.headers.get("x-real-ip"),
  });

  if (noop)
    return NextResponse.json({
      noop: true,
      endpoint: "add-dispenser",
      status: 200,
    });

  if (
    !dispenserId ||
    !DISPENSER_PROGRAM_ID ||
    !process.env.AUTHORITY_SEED ||
    !process.env.EXECUTION_WALLET_PRIVATE_KEY ||
    !recipientAddress ||
    !mintAddress ||
    !amount
  ) {
    return NextResponse.json({ error: "Required fields not set", status: 500 });
  }

  const hash = createHash(dispenserId);

  const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
    [Buffer.from(hash), Buffer.from(process.env.AUTHORITY_SEED)],
    new PublicKey(DISPENSER_PROGRAM_ID)
  );

  const rewardKeypair = Keypair.fromSecretKey(
    bs58.decode(process.env.EXECUTION_WALLET_PRIVATE_KEY)
  );

  const anchorWallet = new NodeWallet(rewardKeypair);
  const connection = new Connection(RPC_ENDPOINT, "confirmed");

  const feeCalculator = await connection.getRecentBlockhash();
  const feeInLamports = feeCalculator.feeCalculator.lamportsPerSignature;
  const feeInLamportsWithPadding = feeInLamports + 1000;

  console.log({ feeInLamports, feeInLamportsWithPadding });

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

  const txHash = await sendTransaction(transaction, provider, connection);

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
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

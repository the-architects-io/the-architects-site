import {
  COLLECTION_WALLET_ADDRESS,
  DISPENSER_PROGRAM_ID,
} from "@/constants/constants";
import { IDL } from "@/idl/types/dispenser";
import { handleError } from "@/utils/errors/log-error";
import { createHash } from "@/utils/hashing";
import * as anchor from "@coral-xyz/anchor";
import { Provider } from "@coral-xyz/anchor";
import { PublicKey } from "@metaplex-foundation/js";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { TransactionInstructionCtorFields } from "@solana/web3.js";

// TODO: Move to endpoint
const AUTHORITY_SEED = process.env.NEXT_PUBLIC_AUTHORITY_SEED || "";

export const createOnChainDispenser = async (
  dispenserId: string,
  provider: Provider,
  connection: anchor.web3.Connection,
  anchorWallet: AnchorWallet
): Promise<{
  txHash: string;
  dispenserAddress: string;
  dispenserBump: number;
}> => {
  return new Promise(async (resolve, reject) => {
    anchor.setProvider(provider);

    if (
      !DISPENSER_PROGRAM_ID ||
      !COLLECTION_WALLET_ADDRESS ||
      !dispenserId ||
      !provider ||
      !connection
    ) {
      throw new Error("Missing required parameters");
    }

    if (!provider?.sendAndConfirm) {
      throw new Error("Invalid provider");
    }

    const programId = new PublicKey(DISPENSER_PROGRAM_ID);
    const program = new anchor.Program(IDL, programId, { connection });

    const hash = createHash(dispenserId);
    if (!hash?.match) {
      throw new Error("Invalid dispenserId");
    }

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(hash), Buffer.from(AUTHORITY_SEED)],
      new PublicKey(DISPENSER_PROGRAM_ID)
    );

    const testToken = "C6XSdTg4eQUUtqyCVTBeW7HooJjTjTo2VpAFnKqzLTTx";

    const fromUserAccountAddress = anchorWallet.publicKey;

    const fromTokenAccountAddress = await getAssociatedTokenAddress(
      new PublicKey(testToken),
      new PublicKey(fromUserAccountAddress)
    );

    const toTokenAccountAddress = await getAssociatedTokenAddress(
      new PublicKey(testToken),
      new PublicKey(COLLECTION_WALLET_ADDRESS)
    );

    const receiverAccount = await connection.getAccountInfo(
      toTokenAccountAddress
    );

    const transaction = new anchor.web3.Transaction();

    const hasCreationCharge = false;

    const paymentInstructions: TransactionInstructionCtorFields[] = [];
    if (hasCreationCharge) {
      if (!receiverAccount) {
        paymentInstructions.push(
          createAssociatedTokenAccountInstruction(
            fromUserAccountAddress,
            toTokenAccountAddress,
            new PublicKey(COLLECTION_WALLET_ADDRESS),
            new PublicKey(testToken)
          )
        );
      }

      paymentInstructions.push(
        createTransferInstruction(
          fromTokenAccountAddress,
          toTokenAccountAddress,
          fromUserAccountAddress,
          10000000000
        )
      );
    }

    const creationInstruction = await program.methods
      .createDispenser(Buffer.from(hash), Buffer.from(AUTHORITY_SEED), bump)
      .accounts({
        dispenserAccount: dispenserPda,
        user: anchorWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const latestBlockhash = await connection.getLatestBlockhash();

    if (paymentInstructions.length > 0) {
      transaction.add(...paymentInstructions);
    }
    transaction.add(creationInstruction);

    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = anchorWallet.publicKey;

    console.log("Anchor Wallet:", anchorWallet);
    console.log("Public Key:", anchorWallet.publicKey.toString());
    console.log("Transaction:", transaction);

    let txHash;
    try {
      txHash = await provider.sendAndConfirm(transaction);
      resolve({
        txHash,
        dispenserAddress: dispenserPda.toString(),
        dispenserBump: bump,
      });
    } catch (error) {
      handleError(error as Error);
      reject(error);
    }
  });
};

import { DISPENSER_PROGRAM_ID } from "@/constants/constants";
import { IDL } from "@/target/types/dispenser";
import { createHash } from "@/utils/hashing";
import * as anchor from "@coral-xyz/anchor";
import { Provider } from "@coral-xyz/anchor";
import { PublicKey } from "@metaplex-foundation/js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";

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

    if (!DISPENSER_PROGRAM_ID || !dispenserId || !provider || !connection) {
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

    console.log({ AUTHORITY_SEED });

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(hash), Buffer.from(AUTHORITY_SEED)],
      new PublicKey(DISPENSER_PROGRAM_ID)
    );

    const transaction = await program.methods
      .createDispenser(Buffer.from(hash), Buffer.from(AUTHORITY_SEED), bump)
      .accounts({
        dispenserAccount: dispenserPda,
        user: anchorWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    const latestBlockhash = await connection.getLatestBlockhash();

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
    } catch (err) {
      reject(err);
    }
  });
};

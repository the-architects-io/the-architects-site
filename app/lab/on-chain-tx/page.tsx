"use client";
import * as anchor from "@coral-xyz/anchor";
import { DISPENSER_PROGRAM_ID } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import showToast from "@/features/toasts/show-toast";
import { IDL } from "@/target/types/dispenser";
import { PublicKey } from "@metaplex-foundation/js";
import { useUserData } from "@nhost/nextjs";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { createHash } from "@/utils/hashing";

export enum TokenType {
  SPL,
  NFT,
  SFT,
}

export default function Page() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const user = useUserData();
  const [dispenserId, setDispenserId] = useState<string | null>(
    "8be1c9ae-a9cc-4ab6-8136-6a62f0082e23"
  );

  const getProvider = () => {
    if (!anchorWallet) return null;

    return new anchor.AnchorProvider(connection, anchorWallet, {
      commitment: "processed",
    });
  };

  const sendTransaction = async (transaction: any) => {
    const provider = getProvider();
    if (!anchorWallet || !provider) return;

    const latestBlockhash = await connection.getLatestBlockhash();

    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = anchorWallet.publicKey;

    let txHash;
    try {
      txHash = await provider.sendAndConfirm(transaction);
      showToast({
        primaryMessage: "Dispensed!",
        secondaryMessage: `Transaction: ${txHash}`,
        link: {
          url: `https://explorer.solana.com/tx/${txHash}`,
          title: "View on Solana Explorer",
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateSplTransaction = async () => {
    if (
      !DISPENSER_PROGRAM_ID ||
      !dispenserId ||
      !anchorWallet ||
      !anchorWallet?.signTransaction
    )
      throw new Error("Missing required data.");

    const provider = getProvider();
    if (!provider) throw new Error("No provider");

    // Configure the client to use the local cluster.
    anchor.setProvider(provider);

    const programId = new PublicKey(DISPENSER_PROGRAM_ID);
    const program = new anchor.Program(IDL, programId, { connection });

    const hash = createHash(dispenserId);

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(hash)],
      new PublicKey(DISPENSER_PROGRAM_ID)
    );

    console.log(dispenserPda.toBase58(), bump);
    debugger;

    const transaction = await program.methods
      .dispenseTokens(Buffer.from(hash), 255, new anchor.BN(1))
      .accounts({
        sender: new PublicKey("DmQQ2PVLiPYbKkYbWQ6nUGRdEAWYcJ6tUaiFKUZn6Ys5"),
        recipient: new PublicKey(
          "9k9jNHg5qHKxTtRqEBsfvytRri7qjk3kzUL6J7od9XtZ"
        ),
        mint: new PublicKey("C6XSdTg4eQUUtqyCVTBeW7HooJjTjTo2VpAFnKqzLTTx"),
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    sendTransaction(transaction);
  };

  const handleCreateSolTransaction = async () => {
    if (
      !DISPENSER_PROGRAM_ID ||
      !dispenserId ||
      !anchorWallet ||
      !anchorWallet?.signTransaction
    )
      throw new Error("Missing required data.");

    const provider = getProvider();
    if (!provider) throw new Error("No provider");

    // Configure the client to use the local cluster.
    anchor.setProvider(provider);

    const programId = new PublicKey(DISPENSER_PROGRAM_ID);
    const program = new anchor.Program(IDL, programId, { connection });

    const transaction = await program.methods
      .dispenseSol(
        new PublicKey("A7kW1LYToYqyhK16Pk3sUJT9QSkYp7JhhgPYXCjnq6xu"),
        new anchor.BN(1000000000)
      )
      .accounts({
        sender: new PublicKey("A7kW1LYToYqyhK16Pk3sUJT9QSkYp7JhhgPYXCjnq6xu"),
        recipient: new PublicKey(
          "9k9jNHg5qHKxTtRqEBsfvytRri7qjk3kzUL6J7od9XtZ"
        ),
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    sendTransaction(transaction);
  };

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-3xl text-center mb-4">On-chain transactions</h1>
        <PrimaryButton onClick={handleCreateSolTransaction}>
          go SOL!
        </PrimaryButton>
        <PrimaryButton onClick={handleCreateSplTransaction}>
          go SPL!
        </PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}

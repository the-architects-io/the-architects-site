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

export default function Page() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const user = useUserData();
  const [dispenserId, setDispenserId] = useState<string | null>(
    "ee6261cc-bbe4-46ca-81cb-6ae6a75293ce"
  );

  const getProvider = () => {
    if (!anchorWallet) return null;

    return new anchor.AnchorProvider(connection, anchorWallet, {
      commitment: "processed",
    });
  };

  const handleCreateTransaction = async () => {
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

    const latestBlockhash = await connection.getLatestBlockhash();

    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = anchorWallet.publicKey;

    console.log("Anchor Wallet:", anchorWallet);
    console.log("Public Key:", anchorWallet.publicKey.toString());
    console.log("Transaction:", transaction);

    let txHash;
    try {
      txHash = await provider.sendAndConfirm(transaction);
      showToast({
        primaryMessage: "SOL Dispensed!",
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

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-3xl text-center mb-4">On-chain transactions</h1>
        <PrimaryButton onClick={handleCreateTransaction}>go!</PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}

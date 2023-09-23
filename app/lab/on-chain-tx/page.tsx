"use client";
import * as anchor from "@coral-xyz/anchor";
import { DISPENSER_PROGRAM_ID } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import showToast from "@/features/toasts/show-toast";
import { IDL } from "@/idl/types/dispenser";
import { PublicKey } from "@metaplex-foundation/js";
import { useUserData } from "@nhost/nextjs";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { createHash } from "@/utils/hashing";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { useSearchParams } from "next/navigation";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { useFormik } from "formik";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { getAbbreviatedAddress } from "@/utils/formatting";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const AUTHORITY_SEED = process.env.NEXT_PUBLIC_AUTHORITY_SEED || "";

export default function Page({ params }: { params: any }) {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const user = useUserData();
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const searchParams = useSearchParams();

  const { dispenser, isLoading, name } = useDispenser(
    searchParams.get("id") || ""
  );

  const formik = useFormik({
    initialValues: {
      walletAddress: "",
    },
    onSubmit: async ({ walletAddress }) => {
      try {
        handleCreateSplTransaction();
        showToast({
          primaryMessage: "Sending!",
        });
        formik.setValues({ walletAddress: "" });
      } catch (error: any) {
        console.log("error", error);
        showToast({
          primaryMessage: "Error updating token",
          secondaryMessage: error?.response?.data?.error,
        });
      }
    },
  });

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
        secondaryMessage: `Transaction: ${getAbbreviatedAddress(txHash)}`,
        link: {
          url: `https://solscan.io/tx/${txHash}`,
          title: "View Transaction",
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateSplTransaction = async () => {
    if (!DISPENSER_PROGRAM_ID || !dispenser?.id || !anchorWallet)
      throw new Error("Missing required data.");

    const provider = getProvider();
    if (!provider) throw new Error("No provider");

    // Configure the client to use the local cluster.
    anchor.setProvider(provider);

    const programId = new PublicKey(DISPENSER_PROGRAM_ID);
    const program = new anchor.Program(IDL, programId, { connection });

    const hash = createHash(dispenser.id);

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(hash), Buffer.from(AUTHORITY_SEED)],
      new PublicKey(DISPENSER_PROGRAM_ID)
    );
    const recipient = new PublicKey(formik.values.walletAddress);
    const mint = new PublicKey("C6XSdTg4eQUUtqyCVTBeW7HooJjTjTo2VpAFnKqzLTTx");

    const fromTokenAccount = await getAssociatedTokenAddressSync(
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
          anchorWallet.publicKey,
          toTokenAccount,
          recipient,
          mint
        )
      );
    }

    const ix = await program.methods
      .dispenseTokens(
        Buffer.from(hash),
        Buffer.from(AUTHORITY_SEED),
        bump,
        new anchor.BN(100000000)
      ) // 10 tokens
      .accounts({
        sender: fromTokenAccount,
        recipient: toTokenAccount,
        dispenserPda,
        mint,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    transaction.add(ix);

    sendTransaction(transaction);
  };

  const handleCreateSolTransaction = async () => {
    if (
      !DISPENSER_PROGRAM_ID ||
      !dispenser?.id ||
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

    const hash = createHash(dispenser.id);

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(hash), Buffer.from(AUTHORITY_SEED)],
      new PublicKey(DISPENSER_PROGRAM_ID)
    );

    const amount = new anchor.BN(100000000); // 0.1 SOL

    const transaction = await program.methods
      .dispenseSol(Buffer.from(hash), Buffer.from(AUTHORITY_SEED), bump, amount)
      .accounts({
        sender: dispenserPda,
        recipient: new PublicKey(formik.values.walletAddress),
        dispenserPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    sendTransaction(transaction);
  };

  return (
    <ContentWrapper>
      {!dispenser && hasBeenFetched && <div>Dispenser not found</div>}
      {isLoading && <div>Loading...</div>}
      {!isLoading && dispenser && (
        <Panel className="flex flex-col items-center">
          <ImageWithFallback
            src={dispenser.imageUrl || ""}
            height={120}
            width={120}
            className="w-36 mb-8"
            alt={dispenser.name || "Dispenser image"}
          />
          <p className="text-center text-3xl mb-4">{dispenser.name} </p>
          <p className="text-center text-xl mb-4">{dispenser.description}</p>
          <FormInputWithLabel
            label="Wallet address"
            name="walletAddress"
            value={formik.values.walletAddress}
            onChange={formik.handleChange}
          />
          <PrimaryButton
            onClick={handleCreateSolTransaction}
            className="my-2 mt-8"
          >
            dispense 0.1 SOL!
          </PrimaryButton>
          <PrimaryButton onClick={handleCreateSplTransaction}>
            dispense 10 C6XSdT tokens!
          </PrimaryButton>
        </Panel>
      )}
    </ContentWrapper>
  );
}

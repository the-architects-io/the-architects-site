"use client";
import * as anchor from "@coral-xyz/anchor";
import jsSHA from "jssha";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@metaplex-foundation/js";
import { DISPENSER_PROGRAM_ID } from "@/constants/constants";
// import idl from "@/idls/architects_dispensers.json";
// import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "@/target/types/dispenser";
import { useUserData } from "@nhost/nextjs";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { createHash } from "@/utils/hashing";

export default function Page() {
  const DISPENSER_AUTHORITY_SEED = "dispenser_authority";

  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const user = useUserData();

  const clusterOptions = [
    { label: "Devnet", value: "devnet" },
    { label: "Testnet", value: "testnet" },
    { label: "Mainnet", value: "mainnet-beta" },
  ];
  const [cluseter, setCluster] = useState(clusterOptions[0].value);
  const [dispenserPublicKey, setDispenserPublicKey] =
    useState<PublicKey | null>(null);
  const [dispenserBump, setDispenserBump] = useState<number | null>(null);
  const [dispenserId, setDispenserId] = useState<string | null>(
    "237ac48a-5228-42df-9372-fd9325bc9743"
  );
  const [hash, setHash] = useState<string | null>(null);

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

    const hash = createHash(dispenserId);

    setHash(hash);

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(hash)],
      new PublicKey(DISPENSER_PROGRAM_ID)
    );

    const transaction = await program.methods
      .createDispenser(hash, bump)
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

    // const signedTx = await anchorWallet.signTransaction(transaction);
    console.log("Anchor Wallet:", anchorWallet);
    console.log("Public Key:", anchorWallet.publicKey.toString());
    console.log("Transaction:", transaction);
    // console.log("Signed Transaction:", signedTx);
    // console.log(signedTx.signatures);

    let txHash;
    try {
      txHash = await provider.sendAndConfirm(transaction);
      showToast({
        primaryMessage: "Dispenser created",
        secondaryMessage: `Dispenser address: ${getAbbreviatedAddress(
          dispenserPda.toString()
        )}`,
        link: {
          url: `https://explorer.solana.com/account/${dispenserPda.toString()}`,
          title: "View Dispenser on Solana Explorer",
        },
      });
    } catch (err) {
      console.log(err);
    }
    // remove signer 2
    // console.log({
    //   signedTx,
    //   transaction,
    //   signerOne: signedTx.signatures[0]?.publicKey.toString(),
    //   signerTwo: signedTx.signatures[1]?.publicKey.toString(),
    // });
    // debugger;

    // const txHash = await connection.sendRawTransaction(signedTx.serialize());

    // const result = await connection.confirmTransaction({
    //   blockhash: latestBlockhash.blockhash,
    //   lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    //   signature: txHash,
    // });

    // console.log({ result, transaction });
  };

  const formik = useFormik({
    initialValues: {
      cluster: clusterOptions[0].value,
    },
    onSubmit: async () => {},
  });

  const getDispenserAccount = useCallback(async () => {
    // if (!DISPENSER_PROGRAM_ID) throw new Error("No dispenser program id");
    // const [address, bump] = await findProgramAddressSync(
    //   [Buffer.from("arch-authority")],
    //   new PublicKey(DISPENSER_PROGRAM_ID)
    // );
    // debugger;
    // setDispenserPublicKey(address);
    // setDispenserBump(bump);
  }, []);

  useEffect(() => {
    if (dispenserPublicKey) return;
    getDispenserAccount();
  }, [dispenserPublicKey, getDispenserAccount]);

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-2xl mb-4">Lab</h1>
        <div className="text-xl">Dispesnser ID: {dispenserId}</div>
        <div className="text-xl">Hash: {hash}</div>
        <div className="text-xl">Bump: {dispenserBump}</div>
        <div className="text-xl">Address: {dispenserPublicKey?.toString()}</div>
        <div className="text-xl">User ID: {user?.id}</div>
        {/* <SelectInputWithLabel
          value={formik.values.cluster}
          label="Cluster"
          name="cluster"
          options={clusterOptions}
          onChange={(e) => {
            setCluster(e.target.value);
            formik.handleChange(e);
          }}
          onBlur={formik.handleBlur}
          placeholder="Select a cluster"
          hideLabel={false}
        /> */}
        {dispenserPublicKey && (
          <p className="text-sm text-gray-400">
            Dispenser address: {dispenserPublicKey.toString()}
          </p>
        )}
        <PrimaryButton onClick={handleCreateTransaction}>Create</PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}

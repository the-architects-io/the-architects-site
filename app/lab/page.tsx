"use client";
import * as anchor from "@project-serum/anchor";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { Panel } from "@/features/UI/panel";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@metaplex-foundation/js";
import {
  DISPENSER_PROGRAM_ID,
  REWARD_WALLET_ADDRESS,
} from "@/constants/constants";
import idl from "@/idls/architects_dispensers.json";
import {
  Connection,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createMint,
} from "@solana/spl-token";

export default function Page() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

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
    "2d7ac48a-5228-42df-9372-fd9325bc9741"
  );
  const program = anchor.workspace.Architects;

  const handleTransaction = async () => {
    if (
      !wallet ||
      !publicKey ||
      !DISPENSER_PROGRAM_ID ||
      !dispenserBump ||
      !dispenserPublicKey ||
      !dispenserId
    )
      throw new Error("Missing required data.");
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const mintAuthority = anchor.web3.Keypair.generate();
    let mintA = new PublicKey("AAbLJZ581QeCrWTZCq4aMgT7MzHnJodaF8hV5hDW5W5Q");
    let mintB = new PublicKey("DbsAqTEannHh9A5Yv2S5rCorTGu9VS73e2d5A62pXqc2");
    let initializerTokenAccountA = null as unknown as PublicKey;
    let initializerTokenAccountB = null as unknown as PublicKey;
    let takerTokenAccountA = null as unknown as PublicKey;
    let takerTokenAccountB = null as unknown as PublicKey;

    const programId = new PublicKey(DISPENSER_PROGRAM_ID);
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const authoritySeed = "arch-authority";
    const stateSeed = "state";
    const randomSeed: anchor.BN = new anchor.BN(
      Math.floor(Math.random() * 100000000)
    );

    // Derive PDAs: escrowStateKey, vaultKey, vaultAuthorityKey
    const [escrowStateKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        randomSeed.toArrayLike(Buffer, "le", 8),
      ],
      programId
    );

    const [authorityAddress] = await findProgramAddressSync(
      [Buffer.from(authoritySeed), Buffer.from(dispenserId)],
      programId
    );

    const [vaultKey] = PublicKey.findProgramAddressSync(
      [
        authorityAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        Buffer.from(dispenserId),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // const txHash = await sendTransaction(transaction, connection, {
    //   skipPreflight: false,
    //   preflightCommitment: "confirmed",
    // });
    showToast({
      primaryMessage: "Transaction sent",
      // secondaryMessage: txHash,
    });
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
    if (dispenserPublicKey || !publicKey) return;
    getDispenserAccount();
  }, [dispenserPublicKey, getDispenserAccount, publicKey]);

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-2xl mb-4">Lab</h1>
        <SelectInputWithLabel
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
        />
        {dispenserPublicKey && (
          <p className="text-sm text-gray-400">
            Dispenser address: {dispenserPublicKey.toString()}
          </p>
        )}
        <PrimaryButton onClick={handleTransaction}>Create</PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}

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
import {
  DISPENSER_PROGRAM_ID,
  REWARD_WALLET_ADDRESS,
} from "@/constants/constants";
// import idl from "@/idls/architects_dispensers.json";
// import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";
import { executeTransaction } from "@/utils/transactions/execute-transaction";
import {
  BlockheightBasedTransactionConfirmationStrategy,
  Connection,
  SystemProgram,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "@/target/types/dispenser";

export default function Page() {
  const DISPENSER_AUTHORITY_SEED = "dispenser_authority";

  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

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
    "237ac48a-5228-42df-9372-fd9325bc9744"
  );

  const getProvider = () => {
    if (!anchorWallet) return null;
    /* create the provider and return it to the caller */
    /* network set to local network for now */

    const provider = new anchor.AnchorProvider(connection, anchorWallet, {
      commitment: "processed",
    });

    return provider;
  };

  const createHash = (data: string, outputLength = 32) => {
    const encoder = new jsSHA("SHAKE256", "TEXT");
    encoder.update(data);
    return encoder.getHash("HEX", { outputLen: outputLength });
  };

  const handleCreateTransaction = async () => {
    if (
      !DISPENSER_PROGRAM_ID ||
      !dispenserId ||
      !anchorWallet ||
      !anchorWallet?.signTransaction
    )
      throw new Error("Missing required data.");

    const programId = new PublicKey(DISPENSER_PROGRAM_ID);

    const provider = getProvider();
    if (!provider) throw new Error("No provider");
    // Configure the client to use the local cluster.
    anchor.setProvider(provider);

    const program = new anchor.Program(IDL, programId, { connection });

    const hash = createHash(dispenserId);

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("seed")],
      new PublicKey(DISPENSER_PROGRAM_ID)
    );

    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: anchorWallet.publicKey,
      newAccountPubkey: dispenserPda,
      lamports: await connection.getMinimumBalanceForRentExemption(8 + 40),
      space: 8 + 40,
      programId: program.programId,
    });

    const transaction = await program.methods
      .createDispenser(dispenserPda, bump)
      .accounts({
        dispenserAccount: dispenserPda, // Add this line
        user: anchorWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    // const transaction = new Transaction();
    // transaction.add(createDispenserIx);

    const latestBlockhash = await connection.getLatestBlockhash();

    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = anchorWallet.publicKey;

    // const signedTx = await anchorWallet.signTransaction(transaction);
    console.log("Anchor Wallet:", anchorWallet);
    console.log("Public Key:", anchorWallet.publicKey.toString());
    console.log("Transaction:", transaction);
    // console.log("Signed Transaction:", signedTx);
    // console.log(signedTx.signatures);

    let sig;
    try {
      sig = await provider.sendAndConfirm(transaction);
    } catch (err) {
      console.log(err);
    }

    console.log("sig:", sig);
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
    if (dispenserPublicKey) return;
    getDispenserAccount();
  }, [dispenserPublicKey, getDispenserAccount]);

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1 className="text-2xl mb-4">Lab</h1>
        <div className="text-xl">{dispenserId}</div>
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

"use client";
import * as anchor from "@coral-xyz/anchor";
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
import { AnchorProvider } from "@coral-xyz/anchor";
import { executeTransaction } from "@/utils/transactions/execute-transaction";
import {
  BlockheightBasedTransactionConfirmationStrategy,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

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
    "237ac48a-5228-42df-9372-fd9325bc9741"
  );

  // const provider = new AnchorProvider(
  //   connection,
  //   wallet as unknown as AnchorWallet,
  //   {}
  // );

  const handleCreateTransaction = async () => {
    if (
      !DISPENSER_PROGRAM_ID ||
      !dispenserId ||
      !anchorWallet ||
      !anchorWallet?.signTransaction
    )
      throw new Error("Missing required data.");

    const programId = new PublicKey(DISPENSER_PROGRAM_ID);

    const provider = new anchor.AnchorProvider(
      connection,
      anchorWallet,
      AnchorProvider.defaultOptions()
    );
    anchor.setProvider(provider);
    // const program = new anchor.Program(IDL as anchor.Idl, programId, provider);

    const destination = new PublicKey(
      "9k9jNHg5qHKxTtRqEBsfvytRri7qjk3kzUL6J7od9XtZ"
    );

    const dispenserAuthoritySeed = new Uint8Array(
      Buffer.from(DISPENSER_AUTHORITY_SEED)
    );
    const dispenserIdSeed = new Uint8Array(Buffer.from(dispenserId));
    const seeds = [dispenserAuthoritySeed];

    const [dispenserPda, bump] = await PublicKey.findProgramAddressSync(
      seeds,
      new PublicKey(DISPENSER_PROGRAM_ID)
    );

    const transaction = new Transaction();

    // const ix = await program.methods
    //   .initialize(dispenserIdSeed)
    //   .accounts({
    //     dispenserAccount: dispenserPda,
    //     user: anchorWallet.publicKey,
    //   })
    //   .instruction();
    // const ix = program.instruction.initialize(dispenserIdSeed, {
    //   accounts: {
    //     dispenserAccount: dispenserPda,
    //     user: anchorWallet.publicKey,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //   },
    // });

    // const latestBlockhash = await connection.getLatestBlockhash();

    // transaction.recentBlockhash = latestBlockhash.blockhash;
    // transaction.feePayer = anchorWallet.publicKey;

    // transaction.add(ix);
    // // sign transaction
    // let signedTx;

    // try {
    //   signedTx = await anchorWallet.signTransaction(transaction);
    // } catch (error) {
    //   console.log({ error });
    // }

    // if (!signedTx) throw new Error("No signed transaction");

    // let result;
    // try {
    //   result = await await provider.sendAndConfirm(signedTx);
    // } catch (error) {
    //   console.log({ error });
    // }

    // const signedTx = await anchorWallet.signTransaction(tx);

    // const txHash = await connection.sendRawTransaction(signedTx.serialize());

    // const result = await connection.confirmTransaction({
    //   blockhash: latestBlockhash.blockhash,
    //   lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    //   signature: txHash,
    // });

    const result = await provider.sendAndConfirm(transaction, [
      // anchorWallet
    ]);

    console.log({ result });

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

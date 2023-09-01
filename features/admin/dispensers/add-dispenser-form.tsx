"use client";

import axios from "axios";
import * as anchor from "@coral-xyz/anchor";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { createOnChainDispenser } from "@/utils/dispensers/create-on-chain-dispenser";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useMutation } from "@apollo/client";
import { UPDATE_DISPENSER } from "@/graphql/mutations/update-dispenser";

export type DispenserResponse = {
  id: string;
  name: string;
  imageUrl: string;
};

export const AddDispenserForm = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const router = useRouter();

  const [updateDispenser, { loading }] = useMutation(UPDATE_DISPENSER);

  const formik = useFormik({
    initialValues: {
      name: "",
      imageUrl: "",
      description: "",
    },
    onSubmit: async (values) => {
      if (!anchorWallet) {
        showToast({
          primaryMessage: "Wallet not connected",
          secondaryMessage: "Please connect your wallet",
        });
        return;
      }

      try {
        const { data: dispenser }: { data: Dispenser } =
          await axios.post<Dispenser>("/api/add-dispenser", values);
        const provider = getProvider();

        if (!provider) {
          showToast({
            primaryMessage: "Wallet not connected",
            secondaryMessage: "Please connect your wallet",
          });
          return;
        }

        const { txHash, dispenserAddress } = await createOnChainDispenser(
          dispenser.id,
          provider,
          connection,
          anchorWallet
        );

        const { data: updatedDispenser }: { data: Dispenser } =
          await axios.post("/api/update-dispenser", {
            id: dispenser.id,
            onChainAddress: dispenserAddress.toString(),
          });

        showToast({
          primaryMessage: "Dispenser added",
          secondaryMessage: `Address: ${getAbbreviatedAddress(
            dispenserAddress.toString()
          )}`,
          link: {
            url: `https://explorer.solana.com/tx/${txHash}?cluster=devnet`,
            title: "View transaction",
          },
        });
        router.push("/admin?tab=dispensers");
      } catch (error) {
        showToast({
          primaryMessage: "Error adding dispenser",
        });
        console.log({ error });
      }
    },
  });

  const getProvider = () => {
    if (!anchorWallet) return null;

    return new anchor.AnchorProvider(connection, anchorWallet, {
      commitment: "processed",
    });
  };

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <SharedHead title="Admin" />
      <FormInputWithLabel
        label="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Image url"
        name="imageUrl"
        value={formik.values.imageUrl}
        onChange={formik.handleChange}
      />
      <FormTextareaWithLabel
        label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
      />
      <div className="flex justify-center w-full">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        />
      </div>
    </FormWrapper>
  );
};

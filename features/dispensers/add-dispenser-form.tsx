"use client";

import axios from "axios";
import * as anchor from "@coral-xyz/anchor";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import showToast from "@/features/toasts/show-toast";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { createOnChainDispenser } from "@/utils/dispensers/create-on-chain-dispenser";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { BlueprintApiActions, Dispenser } from "@/app/blueprint/types";
import { useUserData } from "@nhost/nextjs";
import { useEffect } from "react";
import { Connection } from "@solana/web3.js";
import { RPC_ENDPOINT_DEVNET } from "@/constants/constants";

export type DispenserResponse = {
  id: string;
  name: string;
  imageUrl: string;
};

export const AddDispenserForm = ({
  setDispenserId,
  setStep,
}: {
  setDispenserId: (id: string) => void;
  setStep: (step: number) => void;
}) => {
  // const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const router = useRouter();

  const user = useUserData();

  const connection = new Connection(RPC_ENDPOINT_DEVNET, "confirmed");

  const formik = useFormik({
    initialValues: {
      name: "",
      imageUrl: "",
      description: "",
      ownerId: user?.id,
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
        const { data: dispenser }: { data: Dispenser } = await axios.post(
          "/api/blueprint",
          {
            action: BlueprintApiActions.CREATE_DISENSER,
            params: values,
          }
        );

        console.log({ dispenser });

        const provider = getProvider();

        if (!provider) {
          showToast({
            primaryMessage: "Wallet not connected",
            secondaryMessage: "Please connect your wallet",
          });
          return;
        }
        const { txHash, dispenserAddress, dispenserBump } =
          await createOnChainDispenser(
            dispenser.id,
            provider,
            connection,
            anchorWallet
          );

        const { data: updatedDispenser }: { data: Dispenser } =
          await axios.post("/api/update-dispenser", {
            id: dispenser.id,
            rewardWalletAddress: dispenserAddress.toString(),
            rewardWalletBump: dispenserBump,
          });

        console.log({ updatedDispenser });

        setDispenserId(dispenser.id);
        setStep(1);
      } catch (error) {
        showToast({
          primaryMessage: "Error adding dispenser",
        });
        console.log({ error });
      }
    },
  });

  useEffect(() => {
    if (user?.id) {
      formik.setFieldValue("ownerId", user?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const getProvider = () => {
    if (!anchorWallet) return null;

    return new anchor.AnchorProvider(connection, anchorWallet, {
      commitment: "processed",
    });
  };

  return (
    <>
      <h1 className="text-3xl my-4 text-gray-100">Create Dispenser</h1>
      <FormWrapper onSubmit={formik.handleSubmit}>
        <FormInputWithLabel
          label="Name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          description="The name of your dispenser."
        />
        <FormInputWithLabel
          label="Image url"
          name="imageUrl"
          value={formik.values.imageUrl}
          onChange={formik.handleChange}
          description="The url of the image for your dispenser."
        />
        <FormTextareaWithLabel
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          description="A description for your dispenser."
        />
        <div className="flex justify-center w-full pt-4">
          <SubmitButton
            isSubmitting={formik.isSubmitting}
            onClick={formik.handleSubmit}
            buttonText="Continue"
            disabled={
              !formik.values.name ||
              !formik.values.imageUrl ||
              !formik.values.description
            }
          />
        </div>
      </FormWrapper>
    </>
  );
};

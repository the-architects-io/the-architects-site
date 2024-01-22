import {
  ARCHITECTS_API_URL,
  BASE_URL,
  RPC_ENDPOINT,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { handleError } from "@/utils/errors/log-error";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ShdwDrive } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import axios from "axios";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateDriveForm() {
  const router = useRouter();
  const wallet = useWallet();
  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      sizeInKb: "",
      ownerAddress: "",
    },
    onSubmit: async ({ name, sizeInKb }) => {
      let driveAddress: string | null = null;

      const maxRetries = 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, status } = await axios.post(
            `${ARCHITECTS_API_URL}/create-drive`,
            {
              name,
              sizeInKb,
              ownerAddress: wallet?.publicKey?.toString(),
            }
          );

          if (status !== 200) {
            throw new Error("Failed to create drive");
          }

          const { address, txSig } = data;

          console.log({ address, txSig });

          showToast({
            primaryMessage: "Drive created",
            secondaryMessage: `Drive address: ${getAbbreviatedAddress(
              address
            )}`,
          });

          break;
        } catch (error) {
          if (attempt === maxRetries) {
            showToast({
              primaryMessage: "Failed to create drive",
            });
            handleError(error as Error);
            throw error;
          }
          console.error(`Attempt ${attempt} failed: ${error}`);
        }
      }
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit} className="mb-8">
      <h1 className="mb-4 text-2xl">Create Drive</h1>
      <FormInputWithLabel
        label="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Size in KB"
        name="sizeInKb"
        type="number"
        value={formik.values.sizeInKb}
        onChange={formik.handleChange}
      />
      <div className="w-full flex justify-center">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        >
          Create
        </SubmitButton>
      </div>
    </FormWrapper>
  );
}

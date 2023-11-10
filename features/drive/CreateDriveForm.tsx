import { BASE_URL, RPC_ENDPOINT } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { ShdwDrive } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateDriveForm() {
  const router = useRouter();
  const wallet = useWallet();
  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);

  const formik = useFormik({
    initialValues: {
      storageName: "",
      sizeInMb: "10",
    },
    onSubmit: async ({ storageName, sizeInMb }) => {
      if (!wallet?.publicKey || !shadowDrive) return;
      const sizeInKb = parseInt(sizeInMb) * 1024;

      const { shdw_bucket, transaction_signature: tx } =
        await shadowDrive.createStorageAccount(storageName, `${sizeInKb}KB`);

      if (tx) {
        showToast({
          primaryMessage: "Drive created",
          link: {
            title: "View transaction",
            url: `https://explorer.solana.com/tx/${tx}`,
          },
        });

        const mintAddress = shdw_bucket.replace("%7D", "");
        formik.setValues({ storageName: "", sizeInMb: "" });
        // setTimeout(() => {
        //   router.push(`${BASE_URL}/drive/${mintAddress}}`);
        // },  1000);
        router.push(`${BASE_URL}/drive`);
      } else {
        showToast({
          primaryMessage: "Error creating drive",
        });
      }
    },
  });

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        // Always use mainnet
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const drive = await new ShdwDrive(connection, wallet).init();
        setShadowDrive(drive);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  return (
    <FormWrapper onSubmit={formik.handleSubmit} className="mb-8">
      <h1 className="mb-4 text-2xl">Create Drive</h1>
      <FormInputWithLabel
        label="Name"
        name="storageName"
        value={formik.values.storageName}
        onChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Size in MB"
        name="sizeInMb"
        type="number"
        value={formik.values.sizeInMb}
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

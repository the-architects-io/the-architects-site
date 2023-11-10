"use client";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { getRpcEndpoint } from "@/utils/rpc";
import ShadowUpload from "@/utils/shadow-upload";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useFormik } from "formik";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ShdwPage() {
  const wallet = useWallet();

  const [shadowDrive, setShadowDrive] = useState<ShdwDrive | null>(null);
  const [storageAccounts, setStorageAccounts] = useState<
    { account: StorageAccountV2; publicKey: PublicKey }[]
  >([]);

  const formik = useFormik({
    initialValues: {
      storageName: "architest",
      sizeInMb: "10",
    },
    onSubmit: async ({ storageName, sizeInMb }) => {
      if (!wallet?.publicKey || !shadowDrive) return;

      const response = await shadowDrive.createStorageAccount(
        storageName,
        `${sizeInMb}MB`
      );

      if (response?.transaction_signature) {
        showToast({
          primaryMessage: "Created!",
        });
        formik.setValues({ storageName: "", sizeInMb: "" });
      }
    },
  });

  const fetchStorageAccounts = async (drive: ShdwDrive) => {
    const accounts = await drive.getStorageAccounts();

    if (accounts.length === 0) return;

    setStorageAccounts(accounts);
  };

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const connection = new Connection(getRpcEndpoint(), "confirmed");
        const drive = await new ShdwDrive(connection, wallet).init();
        setShadowDrive(drive);

        fetchStorageAccounts(drive);

        // upload file
        // const upload = await drive.uploadFile(acc, new File([""], "test.txt"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.publicKey]);

  return (
    <ContentWrapper className="flex flex-col items-center">
      {!!shadowDrive && !!storageAccounts.length ? (
        <div className="flex flex-col mb-8 items-center">
          <h1 className="mb-8 text-2xl text-center">Storage Accounts</h1>
          <div className="flex flex-wrap justify-center w-full mx-auto">
            {storageAccounts.map(({ publicKey, account }, i) => (
              <div
                className="flex flex-col space-x-4 p-4 border rounded-md m-2"
                key={publicKey?.toString() || i}
              >
                <div className="flex justify-between mb-2">
                  <div className="font-bold mr-4">{account?.identifier}</div>
                  <div>
                    {/* convert from bytes */}
                    {!!Number(account?.storage) &&
                      `${(Number(account.storage) / 100000).toFixed(2)}MB`}
                  </div>
                  <div className="italic">
                    ({getAbbreviatedAddress(publicKey?.toString())})
                  </div>
                </div>
                <div className="flex">
                  <ShadowUpload
                    drive={shadowDrive}
                    accountPublicKey={publicKey}
                  />
                  <div className="flex flex-col justify-end">
                    <SecondaryButton className="flex-grow-0">
                      <Link
                        href={`/admin/shdw/storage-account/${publicKey?.toString()}`}
                      >
                        View
                      </Link>
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h1 className="mb-4 text-2xl">No Storage Accounts</h1>
        </>
      )}
      <FormWrapper onSubmit={formik.handleSubmit} className="mb-8">
        <h1 className="mb-4 text-2xl">Create Storage Accounts</h1>
        <FormInputWithLabel
          label="Storage Name"
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
    </ContentWrapper>
  );
}

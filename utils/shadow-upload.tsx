"use client";
import React, { useState } from "react";
import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import FormData from "form-data";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { useAdmin } from "@/hooks/admin";
import { useFormik } from "formik";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { PublicKey } from "@metaplex-foundation/js";

export default function ShadowUpload({
  drive,
  accountPublicKey,
}: {
  drive: ShdwDrive;
  accountPublicKey: PublicKey;
}) {
  const { isAdmin } = useAdmin();
  const [file, setFile] = useState<File | ShadowFile | null>(null);
  const [uploadUrl, setUploadUrl] = useState<String | null>(null);
  const [txnSig, setTxnSig] = useState<String | null>(null);
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div>
      <form
        className="flex flex-col items-center py-4"
        onSubmit={async (event) => {
          event.preventDefault();

          if (!file) {
            alert("No file selected");
            return;
          }
          const drive = await new ShdwDrive(connection, wallet).init();
          // const getStorageAccount = await drive.getStorageAccount(accountPublicKey);

          const upload = await drive.uploadFile(accountPublicKey, {
            name: file.name,
            // @ts-ignore
            file, // typed as Buffer but should be File
          });
          console.log(upload);
          console.log({ upload });
          // setUploadUrl(upload.finalized_location);
          // setTxnSig(upload.transaction_signature);
        }}
      >
        <input
          className="py-4"
          type="file"
          onChange={(e) => setFile(!!e.target.files ? e.target.files[0] : null)}
        />
        <br />
        <PrimaryButton type="submit">Upload</PrimaryButton>
      </form>
      <div>
        {uploadUrl ? (
          <div>
            <h3>Success!</h3>
            <h4>URL: {uploadUrl}</h4>
            <h4>Sig: {txnSig}</h4>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

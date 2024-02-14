"use client";
import React, { useState } from "react";
import { ShdwDrive } from "@shadow-drive/sdk";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { useAdmin } from "@/hooks/admin";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { PublicKey } from "@metaplex-foundation/js";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { encryptFileList } from "@/utils/encryption";
import { useWallet } from "@solana/wallet-adapter-react";
import { handleError } from "@/utils/errors/log-error";

export default function ShadowUpload({
  drive,
  accountPublicKey,
  onCompleted,
}: {
  drive: ShdwDrive;
  accountPublicKey: PublicKey;
  onCompleted?: () => void;
}) {
  const { publicKey } = useWallet();
  const { isAdmin } = useAdmin();
  const [files, setFiles] = useState<FileList | File[] | null>(null);
  const [uploadUrl, setUploadUrl] = useState<String | null>(null);
  const [txnSig, setTxnSig] = useState<String | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [shouldShowAdvancedSettings, setShouldShowAdvancedSettings] =
    useState<boolean>(false);
  const [numberOfConcurrentUploads, setNumberOfConcurrentUploads] =
    useState<number>(6);
  const [shouldEncrypt, setShouldEncrypt] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!publicKey) return;

    if (!files?.length) {
      alert("No file selected");
      return;
    }

    let filesToUpload = files;

    if (shouldEncrypt) {
      const encryptedFiles = await encryptFileList(files, publicKey);
      filesToUpload = encryptedFiles;
    }

    setIsSending(true);
    let upload;
    if (files.length === 1) {
      try {
        upload = await drive.uploadFile(accountPublicKey, filesToUpload[0]);
        setIsSending(false);
        onCompleted?.();
      } catch (error) {
        handleError(error as Error);
        showToast({
          primaryMessage: "Error",
          secondaryMessage: `Failed to upload`,
        });
        return;
      } finally {
        setIsSending(false);
        onCompleted?.();
      }
    } else {
      try {
        upload = await drive.uploadMultipleFiles(
          accountPublicKey,
          // @ts-ignore
          filesToUpload,
          numberOfConcurrentUploads || 6
        );
        setIsSending(false);
      } catch (error) {
        handleError(error as Error);
        showToast({
          primaryMessage: "Error",
          secondaryMessage: `Failed to upload`,
        });
        return;
      } finally {
        setIsSending(false);
        onCompleted?.();
      }
    }
    console.log({ upload });
    setIsSending(false);
    showToast({
      primaryMessage: "Completed",
    });
    // setUploadUrl(upload.finalized_location);
    // setTxnSig(upload.transaction_signature);
  };

  // if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div>
      <form className="flex flex-col py-4" onSubmit={handleSubmit}>
        <FormCheckboxWithLabel
          label="Show Advanced Settings"
          name="advancedSettings"
          value={shouldShowAdvancedSettings}
          onChange={() =>
            setShouldShowAdvancedSettings(!shouldShowAdvancedSettings)
          }
        />
        {shouldShowAdvancedSettings && (
          <div className="flex flex-col py-4">
            <div className="mb-4">
              <FormInputWithLabel
                type="number"
                label="Number of concurrent uploads"
                value={numberOfConcurrentUploads}
                name="numberOfConcurrentUploads"
                min={1}
                max={200}
                onChange={(e) =>
                  setNumberOfConcurrentUploads(Number(e.target.value))
                }
              />
            </div>
            <FormCheckboxWithLabel
              label="Encrypt"
              name="shouldEncrypt"
              value={shouldEncrypt}
              onChange={() => setShouldEncrypt(!shouldEncrypt)}
            />
          </div>
        )}
        <input
          multiple
          className="py-4"
          type="file"
          onChange={(e) => setFiles(!!e.target.files ? e.target.files : null)}
        />
        <br />
        <PrimaryButton
          type="submit"
          disabled={isSending || isNaN(numberOfConcurrentUploads)}
          className="w-1/2 flex justify-center"
        >
          {isSending ? <Spinner /> : "Upload"}
        </PrimaryButton>
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

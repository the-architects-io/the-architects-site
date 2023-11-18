"use client";
import React, { useState } from "react";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { useAdmin } from "@/hooks/admin";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { ContentWrapper } from "@/features/UI/content-wrapper";

export default function JsonFileUpload({
  onCompleted,
}: {
  onCompleted?: () => void;
}) {
  const { isAdmin } = useAdmin();
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!files?.length) {
      alert("No file selected");
      return;
    }

    setIsSending(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("file", file));

    try {
      showToast({
        primaryMessage: "Adding wallets",
        secondaryMessage: "Please wait",
      });
      const response = await fetch("/api/process-json", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const {
        existingWalletsCount,
        insertedWalletsCount,
        message: primaryMessage,
      } = await response.json();

      showToast({
        primaryMessage,
        secondaryMessage: `${existingWalletsCount} existing, ${insertedWalletsCount} added`,
      });
      onCompleted?.();
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast({
        primaryMessage: "Error",
        secondaryMessage: `Failed to upload`,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      <form
        className="flex flex-col items-center justify-center w-full py-4"
        onSubmit={handleSubmit}
      >
        <input
          multiple
          className="py-4"
          type="file"
          accept=".json"
          onChange={(e) => setFiles(e.target.files)}
        />
        <br />
        <PrimaryButton
          type="submit"
          disabled={isSending}
          className="w-1/2 flex justify-center"
        >
          {isSending ? <Spinner /> : "Upload"}
        </PrimaryButton>
      </form>
    </ContentWrapper>
  );
}

import { createBlueprintClient } from "@/app/blueprint/client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { useState } from "react";

export default function AddAirdropRecipientsForm({
  setStep,
  step,
  airdropId,
}: {
  setStep: (step: number) => void;
  step: number;
  airdropId: string;
}) {
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
    formData.append("file", files[0]);
    formData.append("airdropId", airdropId);

    try {
      showToast({
        primaryMessage: "Adding recipients",
      });

      const blueprint = createBlueprintClient({ cluster: "devnet" });

      const { success, status, message, addedReipientsCount } =
        await blueprint.addAirdropRecipients({
          airdropId,
          recipientsJsonFile: files[0],
        });

      if (!success) {
        throw new Error(`HTTP error! status: ${status}`);
      }

      showToast({
        primaryMessage: message,
        secondaryMessage: `${addedReipientsCount} recipients added`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast({
        primaryMessage: "Error",
        secondaryMessage: `Failed to upload`,
      });
    } finally {
      setIsSending(false);
      setStep(step + 1);
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <h1 className="text-2xl mb-4 text-center w-full">Add Recipients</h1>
      <input
        multiple
        className="py-4 mx-auto"
        type="file"
        accept=".json"
        onChange={(e) => setFiles(e.target.files)}
      />
      <div className="flex w-full justify-center">
        <PrimaryButton
          type="submit"
          disabled={isSending}
          className="w-1/2 flex justify-center"
        >
          {isSending ? <Spinner /> : "Upload"}
        </PrimaryButton>
      </div>
    </FormWrapper>
  );
}

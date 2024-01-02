import { createBlueprintClient } from "@/app/blueprint/client";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { useUserData } from "@nhost/nextjs";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateAirdropForm({
  airdropId,
}: {
  airdropId: string;
}) {
  const router = useRouter();
  const user = useUserData();
  const [files, setFiles] = useState<FileList | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      startTime: "",
      shouldKickoffManually: false,
    },
    onSubmit: async ({ name, startTime, shouldKickoffManually }) => {
      if (!files?.length) {
        showToast({ primaryMessage: "No recipients file selected" });
        return;
      }
      const blueprint = createBlueprintClient({
        cluster: "devnet",
      });

      const { success: updateAirdropSuccess, airdrop } =
        await blueprint.airdrops.updateAirdrop({
          id: airdropId,
          name,
          startTime,
          shouldKickoffManually,
          isReadyToDrop: true,
        });

      const recipients = await files[0].text();

      const { success: addRecipientsSuccess, addedReipientsCount } =
        await blueprint.airdrops.addAirdropRecipients({
          airdropId,
          recipients,
        });

      if (!updateAirdropSuccess || !addRecipientsSuccess) {
        showToast({
          primaryMessage: "Error creating airdrop",
        });
        return;
      }

      showToast({
        primaryMessage: "Airdrop created",
        secondaryMessage: `${addedReipientsCount} recipients added`,
      });

      router.push(`/me/airdrop/${airdrop.id}`);
    },
  });

  useEffect(() => {}, [files]);

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <FormInputWithLabel
        name="name"
        label="Name"
        placeholder="Name"
        className="mb-4"
        onChange={formik.handleChange}
        value={formik.values.name}
      />
      <FormCheckboxWithLabel
        className="pb-2"
        label="Start airdrop manually"
        name="shouldKickoffManually"
        value={formik.values.shouldKickoffManually}
        onChange={(e: any) => {
          formik.setFieldValue("shouldKickoffManually", e.target.checked);
        }}
      />
      {!formik.values.shouldKickoffManually && (
        <FormInputWithLabel
          name="startTime"
          label="Start Time"
          placeholder="Start Time"
          className="mb-4"
          type="datetime-local"
          onChange={formik.handleChange}
          value={formik.values.startTime}
        />
      )}
      <div className="flex items-center">
        <div className="w-1/2">Add recipients JSON</div>
        <div className="py-4 mx-auto w-1/2 flex justify-end">
          <input
            className="block"
            multiple
            type="file"
            accept=".json"
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>
      </div>
      <div className="flex w-full justify-center">
        <SubmitButton
          disabled={!formik.values.name || !files?.length}
          isSubmitting={formik.isSubmitting}
          onClick={formik.submitForm}
        />
      </div>
    </FormWrapper>
  );
}

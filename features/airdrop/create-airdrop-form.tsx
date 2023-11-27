import { createBlueprintClient } from "@/app/blueprint/client";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { useUserData } from "@nhost/nextjs";

import { useFormik } from "formik";
import { useEffect } from "react";

export default function CreateAirdropForm({
  setAirdropId,
  setStep,
}: {
  setAirdropId: (id: string) => void;
  setStep: (step: number) => void;
}) {
  const user = useUserData();

  const formik = useFormik({
    initialValues: {
      name: "",
      ownerId: user?.id,
      startTime: "",
      shouldKickoffManually: false,
    },
    onSubmit: async ({ name, startTime, ownerId, shouldKickoffManually }) => {
      const blueprint = createBlueprintClient({
        cluster: "devnet",
      });

      const { success, airdrop } = await blueprint.createAirdrop({
        name,
        startTime,
        ownerId,
        shouldKickoffManually,
      });

      if (success && airdrop?.id) {
        setAirdropId(airdrop.id);
        setStep(1);
      } else {
        showToast({
          primaryMessage: "Error creating airdrop",
        });
      }
    },
  });

  useEffect(() => {
    if (user?.id) {
      formik.setFieldValue("ownerId", user?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <h1 className="text-2xl mb-4 text-center w-full">Add Airdrop Info</h1>
      <FormInputWithLabel
        name="name"
        label="Name"
        placeholder="Name"
        className="mb-4"
        onChange={formik.handleChange}
        value={formik.values.name}
      />
      <FormCheckboxWithLabel
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
      <div className="flex w-full justify-center">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.submitForm}
        />
      </div>
    </FormWrapper>
  );
}

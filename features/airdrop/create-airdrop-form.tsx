import { AddAirdropResponse } from "@/app/blueprint/types";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import axios from "axios";
import { useFormik } from "formik";

export default function CreateAirdropForm({
  setAirdropId,
  setStep,
}: {
  setAirdropId: (id: string) => void;
  setStep: (step: number) => void;
}) {
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: async ({ name }) => {
      const {
        data,
      }: {
        data: AddAirdropResponse;
      } = await axios.post("/api/add-airdrop", {
        name,
      });

      if (data?.addedAirdrop?.id) {
        setAirdropId(data.addedAirdrop.id);
        setStep(1);
      } else {
        showToast({
          primaryMessage: "Error creating airdrop",
        });
      }
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <h1 className="text-2xl mb-4 text-center w-full">Add Airdrop Info</h1>
      <FormInputWithLabel
        id="name"
        name="name"
        label="Name"
        placeholder="Name"
        className="mb-4"
        onChange={formik.handleChange}
        value={formik.values.name}
      />
      <div className="flex w-full justify-center">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.submitForm}
        />
      </div>
    </FormWrapper>
  );
}

"use client";

import axios from "axios";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";

export const AddDispenserForm = () => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      name: "",
      imageUrl: "",
      description: "",
    },
    onSubmit: async (values) => {
      try {
        await axios.post("/api/add-dispenser", values);
        showToast({
          primaryMessage: "Dispenser added",
        });
        router.push("/admin?tab=dispensers");
      } catch (error) {
        showToast({
          primaryMessage: "Error adding dispenser",
        });
      }
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <SharedHead title="Admin" />
      <FormInputWithLabel
        label="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Image url"
        name="imageUrl"
        value={formik.values.imageUrl}
        onChange={formik.handleChange}
      />
      <FormTextareaWithLabel
        label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
      />
      <div className="flex justify-center w-full">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        />
      </div>
    </FormWrapper>
  );
};

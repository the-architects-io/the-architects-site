"use client";
import { BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { Panel } from "@/features/UI/panel";
import showToast from "@/features/toasts/show-toast";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";

export default function Page() {
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      sellerFeeBasisPoints: 8.0,
      imageFile: null,
    },
    onSubmit: async ({
      name,
      description,
      sellerFeeBasisPoints,
      imageFile,
    }) => {
      if (!imageFile) throw new Error("No image file");
      console.log({ imageFile });
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("sellerFeeBasisPoints", String(sellerFeeBasisPoints));
      formData.append("imageFile", imageFile);

      try {
        const res = await fetch(`${BASE_URL}/api/mint-token`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        console.log({ data });
        showToast({
          primaryMessage: "Minted",
        });
        formik.setValues({
          name: "",
          description: "",
          sellerFeeBasisPoints: 8.0,
          imageFile: null,
        });
      } catch (error) {
        console.log({ error });
        showToast({
          primaryMessage: "Error minting token",
        });
      } finally {
        setFormData(null);
      }
      debugger;
    },
  });

  return (
    <ContentWrapper>
      <Panel>
        <h1>Minting Lab</h1>
        <FormWrapper onSubmit={formik.handleSubmit}>
          <FormInputWithLabel
            label="Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <FormInputWithLabel
            label="Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
          />
          <FormInputWithLabel
            label="Seller Fee Basis Points"
            name="sellerFeeBasisPoints"
            type="number"
            value={formik.values.sellerFeeBasisPoints}
            onChange={formik.handleChange}
          />
          <div className="flex flex-col items-center w-full">
            <input
              className="py-8 mx-auto text-center"
              name="imageFile"
              type="file"
              onChange={(e) => {
                formik.setFieldValue("imageFile", e?.target?.files?.[0]);
              }}
            />
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              onClick={formik.handleSubmit}
            />
          </div>
        </FormWrapper>
      </Panel>
    </ContentWrapper>
  );
}

"use client";
import { generateFakeMetadatas } from "@/app/blueprint/utils/generate-fake-metadatas";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import showToast from "@/features/toasts/show-toast";
import { useFormik } from "formik";
import { useEffect, useState } from "react";

export default function Page() {
  const [metadatas, setMetadatas] = useState<any[] | null>(null);

  const formik = useFormik({
    initialValues: {
      numberToGenerate: 20,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    setMetadatas(generateFakeMetadatas(formik.values.numberToGenerate));
  }, [formik.values.numberToGenerate]);

  return (
    <ContentWrapper className="flex flex-col items-center max-w-md">
      <FormInputWithLabel
        label="Number to generate"
        name="numberToGenerate"
        type="number"
        onChange={formik.handleChange}
        value={formik.values.numberToGenerate}
      />
      <button
        className="mt-8"
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(metadatas));
          showToast({
            primaryMessage: `Copied ${formik.values.numberToGenerate} metadatas to clipboard`,
          });
        }}
      >
        copy to clipboard
      </button>
    </ContentWrapper>
  );
}

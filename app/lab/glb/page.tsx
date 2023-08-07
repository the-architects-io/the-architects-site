"use client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function Page() {
  const [glbSrc, setGlbSrc] = useState<string | null>(null);
  const [nftNumber, setNftNumber] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      nftNumber: "",
    },
    onSubmit: async ({ nftNumber }) => {
      setGlbSrc(
        `https://shdw-drive.genesysgo.net/6YJQWqyCFo4Uecniqwkupy3DZTqwN5BXrCPp2yDxtzwS/_${nftNumber}.glb`
      );
      setNftNumber(nftNumber);
      formik.setValues({ nftNumber: "" });
    },
  });

  return (
    <ContentWrapper className="flex flex-col justify-center items-center h-[80%]">
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js"
        type="module"
      />
      <div className="flex flex-wrap w-full">
        <div className="w-full md:w-1/3">
          <FormWrapper onSubmit={formik.handleSubmit}>
            <FormInputWithLabel
              label="FunGuyz Number"
              name="nftNumber"
              value={formik.values.nftNumber}
              onChange={formik.handleChange}
            />
            <div className="w-full flex justify-center">
              <SubmitButton
                isSubmitting={formik.isSubmitting}
                onClick={formik.handleSubmit}
              >
                Load
              </SubmitButton>
            </div>
          </FormWrapper>
        </div>
        <div className="w-full md:w-2/3 flex flex-col items-center justify-center">
          {glbSrc && (
            <>
              <div className="flex space-x-6 items-center">
                <div className="text-3xl">3D FunGuyz #{nftNumber}</div>
                <a href={glbSrc} download>
                  <ArrowDownCircleIcon className="h-8 w-8 text-white" />
                </a>
              </div>
              {/* @ts-ignore */}
              <model-viewer
                class="h-[70vh] w-[50vw]"
                src={glbSrc}
                alt="A 3D model of an astronaut"
                shadow-intensity="1"
                auto-rotate
                camera-controls
              />
            </>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}

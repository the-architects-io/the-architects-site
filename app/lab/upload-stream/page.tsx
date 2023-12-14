"use client";
import { EXECUTION_WALLET_ADDRESS } from "@/constants/constants";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import ShadowUpload from "@/features/upload/shadow-upload/shadow-upload";

import { useUserData } from "@nhost/nextjs";
import { PutBlobResult } from "@vercel/blob";
import { useFormik } from "formik";
import { useState } from "react";

export default function StreamUploadPage() {
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const user = useUserData();

  const formik = useFormik({
    initialValues: {
      ownerAddress: "",
      driveAddress: "",
      file: null,
    } as {
      ownerAddress: string;
      driveAddress: string;
      file: File | null;
    },

    onSubmit: async ({ file }) => {},
  });
  return (
    <ContentWrapper className="flex flex-col items-center">
      {!!user?.id && (
        <ShadowUpload
          ownerAddress={EXECUTION_WALLET_ADDRESS}
          driveAddress="5DB4MmQBHdZRet8a789ezNbDeFSpQUMuFG5fxuLGXRhD"
          collectionId="1234567890"
          shouldUnzip={false}
          userId={user?.id}
        />
      )}
      {/* <ChunkedUploady
        multiple
        destination={{
          url: `http://164.90.244.66/api/upload`,
          params: {
            ownerAddress: EXECUTION_WALLET_ADDRESS,
            driveAddress: "6EAWakDFnyKDW4cezXvBZBYyStFdV8UzKfNcgkbd7QMi",
            collectionId: "1234567890",
            shouldUnzip: false,
          },
        }}
        autoUpload={true}
        chunkSize={5 * 1024 * 1024}
        chunked
      >
        <UploadButton />
      </ChunkedUploady> */}
      {/* <FormWrapper onSubmit={formik.handleSubmit} className="flex flex-col">
        <label htmlFor="ownerAddress">Owner Address</label>
        <input
          id="ownerAddress"
          name="ownerAddress"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.ownerAddress}
        />
        <label htmlFor="driveAddress">Drive Address</label>
        <input
          id="driveAddress"
          name="driveAddress"
          type="text"
          onChange={formik.handleChange}
          value={formik.values.driveAddress}
        />
        <label htmlFor="file">File</label>
        <input
          id="file"
          name="file"
          type="file"
          onChange={(event) => {
            formik.setFieldValue("file", event?.currentTarget?.files?.[0]);
          }}
        />
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        >
          Submit
        </SubmitButton>
      </FormWrapper> */}
    </ContentWrapper>
  );
}

"use client";
import { BASE_URL, EXECUTION_WALLET_ADDRESS } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { useUserData } from "@nhost/nextjs";
import ChunkedUploady from "@rpldy/chunked-uploady";
import UploadButton from "@rpldy/upload-button";
import { PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { useFormik } from "formik";
import { use, useState } from "react";

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
      <ChunkedUploady
        multiple
        destination={{
          url: `http://164.90.244.66/api/upload`,
          params: {
            ownerAddress: EXECUTION_WALLET_ADDRESS,
            driveAddress: "6EAWakDFnyKDW4cezXvBZBYyStFdV8UzKfNcgkbd7QMi",
            collectionId: "1234567890",
            shouldUnzip: true,
          },
        }}
        autoUpload={true}
        chunkSize={5 * 1024 * 1024}
        chunked
      >
        <UploadButton />
      </ChunkedUploady>
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

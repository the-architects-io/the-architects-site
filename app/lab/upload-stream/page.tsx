"use client";
import { UploadJob } from "@/app/blueprint/types";
import { EXECUTION_WALLET_ADDRESS } from "@/constants/constants";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import ShadowUpload from "@/features/upload/shadow-upload/shadow-upload";
import { GET_UPLOAD_JOB_BY_ID } from "@/graphql/queries/get-upload-job-by-id";
import { useQuery } from "@apollo/client";

import { useUserData } from "@nhost/nextjs";
import { PutBlobResult } from "@vercel/blob";
import { useFormik } from "formik";
import { useEffect, useState } from "react";

export default function StreamUploadPage() {
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [uploadJobId, setUploadJobId] = useState<string | undefined>(undefined);

  const { loading, error, data } = useQuery(GET_UPLOAD_JOB_BY_ID, {
    variables: {
      id: uploadJobId,
    },
    skip: !uploadJobId,
    pollInterval: 1000,
  });

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
          setUploadJobId={setUploadJobId}
        />
      )}
      {!!data?.uploadJobs_by_pk && (
        <>{JSON.stringify(data.uploadJobs_by_pk, null, 2)}</>
      )}
    </ContentWrapper>
  );
}

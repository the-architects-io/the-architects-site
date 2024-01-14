"use client";
import { EXECUTION_WALLET_ADDRESS } from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import ShadowUpload from "@/features/upload/shadow-upload/shadow-upload";
import { GET_UPLOAD_JOB_BY_ID } from "@/graphql/queries/get-upload-job-by-id";
import { useQuery } from "@apollo/client";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Line } from "rc-progress";
import { useUserData } from "@nhost/nextjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";

export default function StreamUploadPage() {
  const [uploadJobId, setUploadJobId] = useState<string | undefined>(undefined);

  const { loading, error, data } = useQuery(GET_UPLOAD_JOB_BY_ID, {
    variables: {
      id: uploadJobId,
    },
    skip: !uploadJobId,
    pollInterval: 500,
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
        <div className="mb-8">
          {/* <ShadowUpload
            ownerAddress={EXECUTION_WALLET_ADDRESS}
            collectionId="1234567890"
            shouldUnzip={false}
            userId={user?.id}
            setUploadJobId={setUploadJobId}
            onUploadComplete={() => {}}
          /> */}
        </div>
      )}
      {!!data?.uploadJobs_by_pk && (
        <div className="my-8 w-full">
          {data.uploadJobs_by_pk.percentComplete < 100 ? (
            <>
              <div className="text-8xl mb-8 flex flex-col items-center justify-center w-full h-48">
                <div className="flex justify-center items-end mb-4">
                  {data.uploadJobs_by_pk.percentComplete}
                  <span className="text-3xl ml-3 mb-2">%</span>
                </div>
                <div className="w-full max-w-md mb-8">
                  <Line
                    percent={data.uploadJobs_by_pk.percentComplete}
                    trailWidth={1}
                    strokeWidth={3}
                    strokeColor="#0ea5e9"
                    trailColor="#7cd2fb"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-8xl mb-4 flex justify-center items-end w-full">
              <span className="text-green-500 ml-3 mb-2">
                <CheckCircleIcon className="w-48 h-48" />
              </span>
            </div>
          )}
          <div className="text-3xl text-center mb-6">
            {data.uploadJobs_by_pk.statusText || "Uploading..."}
          </div>
          <div className="text-xl mb-4 flex justify-center">
            {(data.uploadJobs_by_pk.sizeInBytes / 1000000).toFixed(2)} MB
          </div>
        </div>
      )}
    </ContentWrapper>
  );
}

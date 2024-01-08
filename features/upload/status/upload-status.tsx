import { UploadJob, UploadJobStatus } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";
import { GET_UPLOAD_JOB_BY_ID } from "@/graphql/queries/get-upload-job-by-id";
import { useLazyQuery, useQuery } from "@apollo/client";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { UploadyContextType } from "@rpldy/uploady";
import { useRouter } from "next/navigation";
import { Line } from "rc-progress";
import { useEffect, useState } from "react";

type UploadJobResponse =
  | {
      uploadJobs_by_pk: UploadJob;
    }
  | null
  | undefined;

export const UploadStatus = ({
  jobId,
  setJob,
  jsonUploadyInstance,
  zipFileUploadyInstance,
}: {
  jobId: string;
  setJob: (job: UploadJob | null) => void;
  jsonUploadyInstance: UploadyContextType | null;
  zipFileUploadyInstance: UploadyContextType | null;
}) => {
  const router = useRouter();
  const { loading, data }: { loading: boolean; data: UploadJobResponse } =
    useQuery(GET_UPLOAD_JOB_BY_ID, {
      variables: { id: jobId },
      pollInterval: 500,
    });

  const handleClearJob = () => {
    setJob(null);
    jsonUploadyInstance?.clearPending();
    zipFileUploadyInstance?.clearPending();
  };

  useEffect(() => {
    if (data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.COMPLETE) {
      showToast({
        primaryMessage: "Asset upload complete!",
      });
      router.push(`${BASE_URL}/me//collection`);
    }
  }, [data?.uploadJobs_by_pk?.status?.name, router]);

  if (!loading && !data?.uploadJobs_by_pk) {
    return null;
  }

  return (
    <>
      {data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.COMPLETE && (
        <div className="mb-8 flex items-center justify-center w-full h-full">
          <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-4" />
          <div>Asset upload complete!</div>
        </div>
      )}
      {data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.ERROR && (
        <div className="mb-8 flex flex-col items-center justify-center w-full h-full">
          <div className="mb-4">Asset upload failed</div>
          <PrimaryButton onClick={handleClearJob}>Retry</PrimaryButton>
        </div>
      )}
      {data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.IN_PROGRESS && (
        <div className="mb-8 w-full">
          {data?.uploadJobs_by_pk?.percentComplete > 0 &&
            data?.uploadJobs_by_pk?.percentComplete < 100 && (
              <>
                <div className="mb-8 flex flex-col items-center justify-center w-full h-48">
                  <div className="flex justify-center items-end mb-4">
                    <div className="text-6xl">
                      {data?.uploadJobs_by_pk?.percentComplete}
                    </div>
                    <span className="ml-3 text-xl">%</span>
                  </div>
                  <div className="w-full max-w-md mb-8">
                    <Line
                      percent={data?.uploadJobs_by_pk?.percentComplete}
                      trailWidth={1}
                      strokeWidth={3}
                      strokeColor="#10B981"
                    />
                  </div>
                </div>
              </>
            )}
          {data?.uploadJobs_by_pk?.percentComplete === 100 ? (
            <div className="flex justify-center w-full">
              <div className="text-green-500 flex items-center gap-x-2 uppercase">
                <CheckBadgeIcon className="w-5 h-5" />
                <div>Success</div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {data?.uploadJobs_by_pk?.statusText || "Uploading..."}
            </div>
          )}
        </div>
      )}
    </>
  );
};

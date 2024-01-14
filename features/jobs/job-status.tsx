import { UploadJob, UploadJobStatus } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { JobIcon, JobIconType } from "@/features/jobs/job-icon";
import { PercentCompleteIndicator } from "@/features/jobs/percent-complete-indicator";
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

export const JobStatus = ({
  jobId,
  setJob,
  jsonUploadyInstance,
  zipFileUploadyInstance,
}: {
  jobId: string;
  setJob: (job: UploadJob | null) => void;
  jsonUploadyInstance?: UploadyContextType | null;
  zipFileUploadyInstance?: UploadyContextType | null;
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
      setTimeout(() => {
        showToast({
          primaryMessage: "Asset upload complete!",
        });
        router.push(`${BASE_URL}/me//collection`);
      }, 3000);
    }
  }, [data?.uploadJobs_by_pk?.status?.name, router]);

  if (!loading && !data?.uploadJobs_by_pk) {
    return null;
  }

  return (
    <>
      {data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.ERROR && (
        <div className="mb-8 flex flex-col items-center justify-center w-full h-full">
          <div className="mb-4">Asset upload failed</div>
          <PrimaryButton onClick={handleClearJob}>Retry</PrimaryButton>
        </div>
      )}
      {(data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.IN_PROGRESS ||
        data?.uploadJobs_by_pk?.status?.name === UploadJobStatus.COMPLETE) && (
        <div className="mb-8 w-full flex flex-col justify-center items-center">
          <JobIcon
            icon={data?.uploadJobs_by_pk?.icon as unknown as JobIconType}
          />
          <div className="w-full flex justify-center mb-12 text-3xl text-sky-200 mt-4">
            <div>{data?.uploadJobs_by_pk?.statusText}</div>
          </div>
          <PercentCompleteIndicator
            percentComplete={data?.uploadJobs_by_pk?.percentComplete}
          />
        </div>
      )}
    </>
  );
};

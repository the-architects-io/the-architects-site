import { UploadJob, UploadJobStatus } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { Line } from "rc-progress";
import { useEffect, useState } from "react";

export const UploadStatus = ({
  job,
  setJob,
}: {
  job: UploadJob;
  setJob: (job: UploadJob | null) => void;
}) => {
  const [status, setStatus] = useState<UploadJob["status"] | null>(null);
  const [percentComplete, setPercentComplete] = useState<number>(0);
  const [statusText, setStatusText] = useState<string | null>(null);

  useEffect(() => {
    setStatus(job.status);
    setPercentComplete(job.percentComplete);
    setStatusText(job.statusText);
  }, [job]);

  if (!job || !status) {
    return null;
  }

  return (
    <>
      {status.name === UploadJobStatus.COMPLETE && (
        <div className="mb-8 flex items-center justify-center w-full h-full">
          <CheckBadgeIcon className="w-5 h-5 text-green-500 mr-4" />
          <div>Asset upload complete!</div>
        </div>
      )}
      {status.name === UploadJobStatus.ERROR && (
        <div className="mb-8 flex flex-col items-center justify-center w-full h-full">
          <div className="mb-4">Asset upload failed</div>
          <PrimaryButton
            onClick={() => {
              setJob(null);
            }}
          >
            Retry
          </PrimaryButton>
        </div>
      )}
      {status.name === UploadJobStatus.IN_PROGRESS && (
        <div className="mb-8 w-full">
          {percentComplete > 0 && percentComplete < 100 && (
            <>
              <div className="mb-8 flex flex-col items-center justify-center w-full h-48">
                <div className="flex justify-center items-end mb-4">
                  <div className="text-xl">{percentComplete}</div>
                  <span className="ml-3 mb-2">%</span>
                </div>
                <div className="w-full max-w-md mb-8">
                  <Line
                    percent={percentComplete}
                    trailWidth={1}
                    strokeWidth={3}
                    strokeColor="#10B981"
                  />
                </div>
              </div>
            </>
          )}
          {job.percentComplete === 100 ? (
            <div className="flex justify-center w-full">
              <div className="text-green-500 flex items-center gap-x-2 uppercase">
                <CheckBadgeIcon className="w-5 h-5" />
                <div>Success</div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {job.statusText || "Uploading..."}
            </div>
          )}
        </div>
      )}
    </>
  );
};

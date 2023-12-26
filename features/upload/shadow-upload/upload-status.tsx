import { UploadJob } from "@/app/blueprint/types";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { Line } from "rc-progress";

export const UploadStatus = ({ job }: { job: UploadJob }) => {
  return (
    <div className="mb-8 w-full">
      {job.percentComplete > 0 && job.percentComplete < 100 && (
        <>
          <div className="mb-8 flex flex-col items-center justify-center w-full h-48">
            <div className="flex justify-center items-end mb-4">
              <div className="text-xl">{job.percentComplete}</div>
              <span className="ml-3 mb-2">%</span>
            </div>
            <div className="w-full max-w-md mb-8">
              <Line
                percent={job.percentComplete}
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
        <div className="text-center">{job.statusText || "Uploading..."}</div>
      )}
    </div>
  );
};

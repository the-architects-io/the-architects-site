import { CollectionFileStats, ValidationIssue } from "@/app/blueprint/types";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import Spinner from "@/features/UI/spinner";
import { getBestFittingStorageSizeString } from "@/utils/formatting";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export const ZipFileUploadValidation = ({
  fileStats,
  setFileStats,
  setFileBeingUploaded,
}: {
  fileStats: CollectionFileStats | null;
  setFileStats: (stats: CollectionFileStats | null) => void;
  setFileBeingUploaded: (file: File | null) => void;
}) => {
  const [isFileValid, setisFileValid] = useState<boolean | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    []
  );

  const handleClearZipFile = () => {
    setisFileValid(null);
    setValidationIssues([]);
    setFileBeingUploaded(null);
    setFileStats(null);
  };

  useEffect(() => {
    if (!fileStats) return;

    console.log("fileStats", fileStats);

    if (fileStats.files.length === 0) {
      setisFileValid(false);
      setValidationIssues([
        {
          text: "Zip file is empty",
          index: 0,
        },
      ]);
      return;
    }

    if (!fileStats.fileNamesAreValid) {
      setisFileValid(false);
      setValidationIssues([
        {
          text: "Invalid filenames",
          index: 0,
        },
      ]);
      return;
    }

    setisFileValid(true);
  }, [fileStats]);

  return (
    <div className="flex w=full justify-center space-y-5">
      {isFileValid === null && (
        <div className="flex items-center space-x-2">
          <Spinner />
          <div>Validating...</div>
        </div>
      )}
      {isFileValid === false && (
        <div className="flex flex-col items-center space-x-2">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-6 w-6 text-red-500" />
            <div>Invalid asset files</div>
          </div>
          {!!validationIssues.length && (
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex flex-col space-y-2">
                {validationIssues.map((issue, i) => {
                  return (
                    <div key={i}>
                      <div className="text-gray-100">{issue.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-4">
            <SecondaryButton onClick={handleClearZipFile}>
              Clear zip file
            </SecondaryButton>
          </div>
        </div>
      )}
      {isFileValid === true && (
        <div className="flex flex-col items-center space-x-2">
          <div className="flex items-center space-x-2">
            <CheckBadgeIcon className="h-6 w-6 text-green-500" />
            <div>Assets are valid</div>
          </div>
          {!!fileStats && (
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex flex-col space-y-2 text-center">
                  <div className="text-gray-100 text-sm">
                    Total assets: {fileStats.files.length}
                  </div>
                  <div className="text-gray-100 text-sm">
                    Uncompressed size:{" "}
                    {getBestFittingStorageSizeString(
                      fileStats.totalUncompressedSize
                    )}
                  </div>
                </div>
              </div>
              <SecondaryButton onClick={handleClearZipFile}>
                Clear zip file
              </SecondaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

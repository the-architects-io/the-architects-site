import { UploadJsonFileToShadowDriveResponse } from "@/app/api/upload-json-file-to-shadow-drive/route";
import {
  BaseBlueprintResponse,
  BlueprintApiActions,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Spinner from "@/features/UI/spinner";
import { JsonUploadField } from "@/features/upload/json/json-upload-field";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Uploady, { UploadyContextType } from "@rpldy/uploady";
import { useState } from "react";

export const JsonUpload = ({
  driveAddress,
  fileName,
  children,
  uploadyInstance,
  isFileValid,
  setUploadyInstance,
  setJsonUploadResponse,
  setJsonBeingUploaded,
  setJsonFileBeingUploaded,
}: {
  driveAddress: string;
  fileName: string;
  children?: string | JSX.Element | JSX.Element[];
  uploadyInstance: UploadyContextType | null;
  isFileValid: boolean | null;
  setUploadyInstance: (instance: UploadyContextType) => void;
  setJsonUploadResponse: (response: any) => void;
  setJsonBeingUploaded: (json: any) => void;
  setJsonFileBeingUploaded: (file: File) => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);

  return (
    <>
      <Uploady
        accept=".json"
        destination={{
          url: `${BASE_URL}/api/blueprint`,
          params: {
            action: BlueprintApiActions.UPLOAD_JSON,
            driveAddress,
            fileName,
            overwrite: true,
          },
        }}
        isSuccessfulCall={({ response }: { response: string }) => {
          const parsedResponse: UploadJsonFileToShadowDriveResponse &
            BaseBlueprintResponse = JSON.parse(response);
          setJsonUploadResponse(parsedResponse);
          if (parsedResponse.success) {
            setIsSuccessful(true);
            return true;
          }
          setIsSuccessful(false);
          return false;
        }}
        autoUpload={false}
      >
        <JsonUploadField
          isFileValid={isFileValid}
          uploadyInstance={uploadyInstance}
          setUploadyInstance={setUploadyInstance}
          setProgress={setProgress}
          setIsInProgress={setIsInProgress}
          driveAddress={driveAddress}
          setJsonBeingUploaded={setJsonBeingUploaded}
          setJsonFileBeingUploaded={setJsonFileBeingUploaded}
        >
          {isInProgress ? (
            <div className="flex flex-col w-full h-full justify-center items-center text-lg">
              <div className="text-gray-200 mb-4">Processing</div>
              <Spinner />
            </div>
          ) : (
            <>
              {isSuccessful === false && (
                <div className="text-red-500 flex items-center gap-x-2 uppercase">
                  <XMarkIcon className="w-5 h-5" />
                  <div>Failed</div>
                </div>
              )}
              {isSuccessful === true && (
                <div className="text-green-500 flex items-center gap-x-2 uppercase">
                  <CheckBadgeIcon className="w-5 h-5" />
                  <div>Success</div>
                </div>
              )}
              {isSuccessful === null && (
                <div className="underline">
                  {!!children ? children : "Add JSONs"}
                </div>
              )}
            </>
          )}
        </JsonUploadField>
      </Uploady>
    </>
  );
};

import { UploadAssetsToShadowDriveResponse } from "@/app/api/mint-nft/route";
import {
  BaseBlueprintResponse,
  BlueprintApiActions,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Spinner from "@/features/UI/spinner";
import { MultiImageUploadField } from "@/features/upload/multi-image/multi-image-upload-field";
import { CheckBadgeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Uploady from "@rpldy/uploady";
import { useState } from "react";

export const MultiImageUpload = ({
  driveAddress,
  children,
}: {
  driveAddress: string;
  children?: string | JSX.Element | JSX.Element[];
}) => {
  const [progress, setProgress] = useState(0);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);

  return (
    <Uploady
      accept="image/*"
      destination={{
        url: `${BASE_URL}/api/blueprint`,
        params: {
          action: BlueprintApiActions.UPLOAD_FILES,
          driveAddress,
        },
      }}
      isSuccessfulCall={({ response }: { response: string }) => {
        const parsedResponse: UploadAssetsToShadowDriveResponse &
          BaseBlueprintResponse = JSON.parse(response);
        if (parsedResponse.success) {
          setIsSuccessful(true);
          return true;
        }
        setIsSuccessful(false);
        return false;
      }}
      autoUpload={true}
      multiple={true}
    >
      <MultiImageUploadField
        driveAddress={driveAddress}
        setIsInProgress={setIsInProgress}
        setProgress={setProgress}
      >
        {isInProgress ? (
          <div className="flex flex-col w-full h-full justify-center items-center text-lg">
            {progress > 0 && (
              <div className="text-lg font-bold">{progress}%</div>
            )}
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
                {!!children ? children : "Add Images"}
              </div>
            )}
          </>
        )}
      </MultiImageUploadField>
    </Uploady>
  );
};

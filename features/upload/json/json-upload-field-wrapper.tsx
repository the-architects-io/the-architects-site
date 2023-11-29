import { UploadJsonFileToShadowDriveResponse } from "@/app/api/upload-json-file-to-shadow-drive/route";
import {
  BaseBlueprintResponse,
  BlueprintApiActions,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Uploady from "@rpldy/uploady";

export const JsonUploadWrapper = ({
  children,
  driveAddress,
  fileName,
  setJsonUploadResponse,
}: {
  children: JSX.Element | JSX.Element[];
  driveAddress: string;
  fileName: string;
  setJsonUploadResponse: (response: any) => void;
}) => {
  return (
    <Uploady
      destination={{
        url: `${BASE_URL}/api/blueprint`,
        params: {
          action: BlueprintApiActions.UPLOAD_JSON,
          driveAddress,
          fileName,
        },
      }}
      isSuccessfulCall={({ response }: { response: string }) => {
        const parsedResponse: UploadJsonFileToShadowDriveResponse &
          BaseBlueprintResponse = JSON.parse(response);
        setJsonUploadResponse(parsedResponse);
        if (parsedResponse.success) {
          return true;
        }
        return false;
      }}
      autoUpload={true}
    >
      {children}
    </Uploady>
  );
};

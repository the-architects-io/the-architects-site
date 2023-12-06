import {
  BaseBlueprintResponse,
  BlueprintApiActions,
  UploadFileResponse,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Uploady from "@rpldy/uploady";

export const SingleImageUploadFieldWrapper = ({
  children,
  fileName,
  driveAddress,
  autoUpload = false,
  multiple = false,
  setImage,
}: {
  children: JSX.Element | JSX.Element[];
  fileName: string;
  driveAddress: string;
  autoUpload?: boolean;
  multiple?: boolean;
  setImage?: (response: UploadFileResponse & BaseBlueprintResponse) => void;
}) => {
  return (
    <Uploady
      destination={{
        url: `${BASE_URL}/api/blueprint`,
        params: {
          action: BlueprintApiActions.UPLOAD_FILE,
          fileName,
          driveAddress,
          overwrite: true,
        },
      }}
      isSuccessfulCall={({ response }: { response: string }) => {
        const parsedResponse: UploadFileResponse & BaseBlueprintResponse =
          JSON.parse(response);
        if (parsedResponse.success) {
          setImage?.(parsedResponse);
          return true;
        }
        return false;
      }}
      autoUpload={autoUpload}
      multiple={multiple}
    >
      {children}
    </Uploady>
  );
};

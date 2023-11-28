import { BlueprintApiActions } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Uploady from "@rpldy/uploady";

export const SingleImageUploadFieldWrapper = ({
  children,
  fileName,
  driveAddress,
  autoUpload = false,
  multiple = false,
}: {
  children: JSX.Element | JSX.Element[];
  fileName: string;
  driveAddress: string;
  autoUpload?: boolean;
  multiple?: boolean;
}) => {
  return (
    <Uploady
      destination={{
        url: `${BASE_URL}/api/blueprint`,
        params: {
          action: BlueprintApiActions.UPLOAD_FILE,
          fileName,
          driveAddress,
        },
      }}
      autoUpload={autoUpload}
      multiple={multiple}
    >
      {children}
    </Uploady>
  );
};

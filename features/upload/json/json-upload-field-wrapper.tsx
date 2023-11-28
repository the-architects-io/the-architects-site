import { BlueprintApiActions } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Uploady from "@rpldy/uploady";

export const JsonUploadWrapper = ({
  children,
  driveAddress,
  fileName,
}: {
  children: JSX.Element | JSX.Element[];
  driveAddress: string;
  fileName: string;
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
      isSuccessfulCall={({ response }) => response.ok}
      autoUpload={true}
    >
      {children}
    </Uploady>
  );
};

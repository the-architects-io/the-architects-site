import { BlueprintApiActions } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import Uploady from "@rpldy/uploady";

export const MultiImageUploadWrapper = ({
  children,
  driveAddress,
}: {
  children: JSX.Element | JSX.Element[];
  driveAddress: string;
}) => {
  return (
    <Uploady
      accept="image/*"
      destination={{
        url: `${BASE_URL}/api/blueprint`,
        params: {
          action: BlueprintApiActions.UPLOAD_FILES,
          driveAddress,
          overwrite: true,
        },
      }}
      autoUpload={true}
      multiple={true}
    >
      {children}
    </Uploady>
  );
};

import { BlueprintApiActions } from "@/app/blueprint/types";
import UploadButton from "@rpldy/upload-button";
import { useUploady } from "@rpldy/uploady";

export const MultiImageUploadField = ({
  driveAddress,
  children,
}: {
  driveAddress: string;
  children: string | JSX.Element | JSX.Element[];
}) => {
  const uploady = useUploady();

  return (
    <>
      <UploadButton
        className="underline"
        grouped={true}
        params={{
          action: BlueprintApiActions.UPLOAD_FILES,
          driveAddress,
        }}
      >
        {!!children ? children : "Add Images"}
      </UploadButton>
    </>
  );
};

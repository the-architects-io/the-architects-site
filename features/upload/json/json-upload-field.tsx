import { BlueprintApiActions } from "@/app/blueprint/types";
import UploadButton from "@rpldy/upload-button";
import { useUploady } from "@rpldy/uploady";

export const JsonUploadField = ({
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
        params={{
          action: BlueprintApiActions.UPLOAD_JSON,
          driveAddress,
        }}
      >
        {!!children ? children : "Add JSONs"}
      </UploadButton>
    </>
  );
};

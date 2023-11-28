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
        className="underline border border-gray-600 rounded-lg py-12 px-4 w-full min-h-[38vh] mb-4"
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

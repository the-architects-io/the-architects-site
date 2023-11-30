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
        params={{
          action: "UPLOAD_FILES",
          driveAddress,
        }}
      >
        {!!children ? children : "Add JSONs"}
      </UploadButton>
    </>
  );
};

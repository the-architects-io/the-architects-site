import { SingleImageUploadField } from "@/features/upload/single-image/single-image-upload-field";
import { SingleImageUploadFieldWrapper } from "@/features/upload/single-image/single-image-upload-field-wrapper";

export const SingleImageUpload = ({
  fileName,
  driveAddress,
  children,
}: {
  fileName: string;
  driveAddress: string;
  children?: string | JSX.Element | JSX.Element[];
}) => {
  return (
    <SingleImageUploadFieldWrapper
      autoUpload={true}
      fileName={fileName}
      driveAddress={driveAddress}
    >
      <SingleImageUploadField driveAddress={driveAddress} fileName={fileName}>
        {!!children ? children : "Add Image"}
      </SingleImageUploadField>
    </SingleImageUploadFieldWrapper>
  );
};

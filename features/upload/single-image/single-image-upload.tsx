import { SingleImageUploadField } from "@/features/upload/single-image/single-image-upload-field";
import { SingleImageUploadFieldWrapper } from "@/features/upload/single-image/single-image-upload-field-wrapper";

export const SingleImageUpload = ({
  fileName,
  driveAddress,
  children,
  setImage,
}: {
  fileName: string;
  driveAddress: string;
  children?: string | JSX.Element | JSX.Element[];
  setImage?: (response: any) => void;
}) => {
  return (
    <SingleImageUploadFieldWrapper
      autoUpload={true}
      fileName={fileName}
      driveAddress={driveAddress}
      setImage={setImage}
    >
      <SingleImageUploadField driveAddress={driveAddress} fileName={fileName}>
        {!!children ? children : "Add Image"}
      </SingleImageUploadField>
    </SingleImageUploadFieldWrapper>
  );
};

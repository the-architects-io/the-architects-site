import { MultiImageUploadField } from "@/features/upload/multi-image/multi-image-upload-field";
import { MultiImageUploadWrapper } from "@/features/upload/multi-image/multi-image-upload-field-wrapper";

export const MultiImageUpload = ({
  driveAddress,
  children,
}: {
  driveAddress: string;
  children?: string | JSX.Element | JSX.Element[];
}) => {
  return (
    <MultiImageUploadWrapper driveAddress={driveAddress}>
      <MultiImageUploadField driveAddress={driveAddress}>
        {!!children ? children : "Add Images"}
      </MultiImageUploadField>
    </MultiImageUploadWrapper>
  );
};

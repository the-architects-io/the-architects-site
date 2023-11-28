import { MultiJsonUploadField } from "@/features/upload/multi-json/multi-json-upload-field";
import { MultiJsonUploadWrapper } from "@/features/upload/multi-json/multi-json-upload-field-wrapper";

export const MultiJsonUpload = ({
  driveAddress,
  children,
}: {
  driveAddress: string;
  children?: string | JSX.Element | JSX.Element[];
}) => {
  return (
    <MultiJsonUploadWrapper driveAddress={driveAddress}>
      <MultiJsonUploadField driveAddress={driveAddress}>
        {!!children ? children : "Add JSONs"}
      </MultiJsonUploadField>
    </MultiJsonUploadWrapper>
  );
};

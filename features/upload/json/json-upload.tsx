import { JsonUploadField } from "@/features/upload/json/json-upload-field";
import { JsonUploadWrapper } from "@/features/upload/json/json-upload-field-wrapper";

export const JsonUpload = ({
  driveAddress,
  fileName,
  children,
}: {
  driveAddress: string;
  fileName: string;
  children?: string | JSX.Element | JSX.Element[];
}) => {
  return (
    <JsonUploadWrapper driveAddress={driveAddress} fileName={fileName}>
      <JsonUploadField driveAddress={driveAddress}>
        {!!children ? children : "Add JSONs"}
      </JsonUploadField>
    </JsonUploadWrapper>
  );
};

import { UploadJsonFileToShadowDriveResponse } from "@/app/api/upload-json-file-to-shadow-drive/route";
import { JsonUploadField } from "@/features/upload/json/json-upload-field";
import { JsonUploadWrapper } from "@/features/upload/json/json-upload-field-wrapper";

export const JsonUpload = ({
  driveAddress,
  fileName,
  children,
  setJsonUploadResponse,
}: {
  driveAddress: string;
  fileName: string;
  children?: string | JSX.Element | JSX.Element[];
  setJsonUploadResponse: (response: any) => void;
}) => {
  return (
    <JsonUploadWrapper
      driveAddress={driveAddress}
      fileName={fileName}
      setJsonUploadResponse={setJsonUploadResponse}
    >
      <JsonUploadField driveAddress={driveAddress}>
        {!!children ? children : "Add JSONs"}
      </JsonUploadField>
    </JsonUploadWrapper>
  );
};

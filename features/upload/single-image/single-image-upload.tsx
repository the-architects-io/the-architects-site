import Spinner from "@/features/UI/spinner";
import { SingleImageUploadField } from "@/features/upload/single-image/single-image-upload-field";
import {
  SingleImageUploadFieldWrapper,
  SingleImageUploadResponse,
} from "@/features/upload/single-image/single-image-upload-field-wrapper";
import { CheckBadgeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export const SingleImageUpload = ({
  fileName,
  driveAddress,
  children,
  setImage,
}: {
  fileName: string;
  driveAddress: string;
  children?: string | JSX.Element | JSX.Element[];
  setImage?: (response: SingleImageUploadResponse) => void;
}) => {
  const [isInProgress, setIsInProgress] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);

  return (
    <SingleImageUploadFieldWrapper
      autoUpload={true}
      fileName={fileName}
      driveAddress={driveAddress}
      setImage={setImage}
    >
      <SingleImageUploadField
        isInProgress={isInProgress}
        driveAddress={driveAddress}
        fileName={fileName}
        setIsInProgress={setIsInProgress}
      >
        {!!children ? children : "Add Image"}
      </SingleImageUploadField>
    </SingleImageUploadFieldWrapper>
  );
};

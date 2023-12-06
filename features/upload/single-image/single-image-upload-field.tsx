import Spinner from "@/features/UI/spinner";
import { PreviewComponent } from "@/features/upload/single-image/preview-component";
import {
  CheckBadgeIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import UploadButton from "@rpldy/upload-button";
import UploadPreview, {
  PreviewItem,
  PreviewMethods,
} from "@rpldy/upload-preview";
import Uploady, {
  Batch,
  useBatchAddListener,
  useBatchFinishListener,
  useUploady,
} from "@rpldy/uploady";
import Image from "next/image";
import { useRef, useState } from "react";

export const SingleImageUploadField = ({
  driveAddress,
  fileName,
  children,
  isInProgress,
  setIsInProgress,
}: {
  driveAddress: string;
  fileName: string;
  children: string | JSX.Element | JSX.Element[];
  isInProgress: boolean;
  setIsInProgress: (isInProgress: boolean) => void;
}) => {
  const uploady = useUploady();

  const imagePreviewMethodsRef = useRef<PreviewMethods>(null);
  const [selectedCollectionImagePreview, setSelectedCollectionImagePreview] =
    useState<PreviewItem | null>(null);

  const [batch, setBatch] = useState<Batch | null>(null);
  const [isSuccessful, setIsSuccessful] = useState<boolean | null>(null);

  useBatchAddListener((batch: Batch) => {
    setBatch(batch);
    setIsInProgress(true);
  });

  useBatchFinishListener((batch: Batch) => {
    setIsInProgress(false);
    setIsSuccessful(batch.completed === 100);
  });

  return (
    <div className="pb-8 flex flex-col items-center w-full">
      <UploadPreview
        previewMethodsRef={imagePreviewMethodsRef}
        onPreviewsChanged={(previews) => {
          console.log({ previews });
          setSelectedCollectionImagePreview(previews[0]);
        }}
        PreviewComponent={({ url }: { url: string }) => (
          <PreviewComponent
            url={url}
            clearPreview={() => imagePreviewMethodsRef.current?.clear()}
            isInProgress={isInProgress}
            isSuccessful={isSuccessful}
          />
        )}
      />

      {!selectedCollectionImagePreview && (
        <UploadButton
          className="underline border border-gray-600 rounded-lg py-12 px-4 w-full"
          params={{
            action: "UPLOAD_FILE",
            driveAddress,
            fileName,
            overwrite: true,
          }}
        >
          {!!children ? children : "Add Image"}
        </UploadButton>
      )}
    </div>
  );
};

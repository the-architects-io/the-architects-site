import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import { XCircleIcon } from "@heroicons/react/24/outline";
import UploadButton from "@rpldy/upload-button";
import UploadPreview, {
  PreviewItem,
  PreviewMethods,
} from "@rpldy/upload-preview";
import Uploady, { useUploady } from "@rpldy/uploady";
import Image from "next/image";
import { useRef, useState } from "react";

export const SingleImageUploadField = ({
  driveAddress,
  fileName,
  children,
}: {
  driveAddress: string;
  fileName: string;
  children: string | JSX.Element | JSX.Element[];
}) => {
  const uploady = useUploady();

  const imagePreviewMethodsRef = useRef<PreviewMethods>(null);
  const [selectedCollectionImagePreview, setSelectedCollectionImagePreview] =
    useState<PreviewItem | null>(null);

  return (
    <div className="pb-8 flex flex-col items-center w-full">
      <UploadPreview
        previewMethodsRef={imagePreviewMethodsRef}
        onPreviewsChanged={(previews) => {
          console.log({ previews });
          setSelectedCollectionImagePreview(previews[0]);
        }}
        PreviewComponent={({ url }: { url: string }) => (
          <div className="relative border border-gray-600 p-2 rounded-lg mb-2">
            <Image src={url} alt="Collection Image" width={500} height={500} />
            <button
              onClick={() => imagePreviewMethodsRef.current?.clear()}
              className="absolute -mt-4 -mr-4 top-0 right-0"
            >
              <XCircleIcon className="h-10 w-10 text-gray-100 bg-black rounded-full" />
            </button>
          </div>
        )}
      />

      {!selectedCollectionImagePreview && (
        <UploadButton
          className="underline border border-gray-600 rounded-lg py-12 px-4 w-full"
          params={{
            action: "UPLOAD_FILE",
            driveAddress,
            fileName,
          }}
        >
          {!!children ? children : "Add Image"}
        </UploadButton>
      )}
    </div>
  );
};

import { BlueprintApiActions } from "@/app/blueprint/types";
import UploadButton from "@rpldy/upload-button";
import { useBatchAddListener, useUploady } from "@rpldy/uploady";
import { useEffect } from "react";

export const JsonUploadField = ({
  driveAddress,
  children,
  setJsonBeingUploaded,
}: {
  driveAddress: string;
  children: string | JSX.Element | JSX.Element[];
  setJsonBeingUploaded: (json: any) => void;
}) => {
  const uploady = useUploady();

  useBatchAddListener((batch) => {
    const fileLike = batch.items[0].file;
    if (fileLike instanceof Blob) {
      const reader = new FileReader();
      reader.readAsText(fileLike);
      reader.onload = () => {
        try {
          const fileContentAsJson = JSON.parse(reader.result as string);
          setJsonBeingUploaded(fileContentAsJson);
          debugger;
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
    }
  });

  return (
    <UploadButton
      className="underline"
      params={{
        action: BlueprintApiActions.UPLOAD_JSON,
        driveAddress,
      }}
    >
      {!!children ? children : "Add JSONs"}
    </UploadButton>
  );
};

import { BlueprintApiActions } from "@/app/blueprint/types";
import UploadButton from "@rpldy/upload-button";
import {
  Batch,
  useBatchAddListener,
  useBatchFinalizeListener,
  useBatchFinishListener,
  useUploady,
} from "@rpldy/uploady";
import { useEffect, useState } from "react";

export const JsonUploadField = ({
  driveAddress,
  children,
  setJsonBeingUploaded,
  setIsInProgress,
  setProgress,
}: {
  driveAddress: string;
  children: string | JSX.Element | JSX.Element[];
  setJsonBeingUploaded: (json: any) => void;
  setIsInProgress: (isInProgress: boolean) => void;
  setProgress: (progress: number) => void;
}) => {
  const uploady = useUploady();

  const [batch, setBatch] = useState<Batch | null>(null);

  useBatchAddListener((batch: Batch) => {
    setBatch(batch);
    console.log("batch add", batch);
    setIsInProgress(true);
    const reader = new FileReader();
    reader.readAsText(batch.items[0].file as unknown as Blob);
    reader.onload = () => {
      const json = JSON.parse(reader.result as string);
      setJsonBeingUploaded(json);
    };
  });

  useBatchFinishListener((batch: Batch) => {
    console.log("batch finish", batch);
    setIsInProgress(false);
  });

  useEffect(() => {
    if (!batch?.completed) return;
  }, [batch?.completed, batch?.total, setProgress]);

  return (
    <UploadButton
      params={{
        action: BlueprintApiActions.UPLOAD_JSON,
        driveAddress,
        overwrite: true,
      }}
    >
      {!!children ? children : "Add JSONs"}
    </UploadButton>
  );
};

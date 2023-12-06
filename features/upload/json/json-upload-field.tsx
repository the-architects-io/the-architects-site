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
  });

  useBatchFinishListener((batch: Batch) => {
    console.log("batch finish", batch);
    setIsInProgress(false);
  });

  useEffect(() => {
    if (!batch?.completed) return;

    if (batch?.completed > 0) {
      setProgress(Math.round((batch.completed / batch.total) * 100));
    }
  }, [batch?.completed, batch?.total, setProgress]);

  return (
    <UploadButton
      params={{
        action: BlueprintApiActions.UPLOAD_JSON,
        driveAddress,
      }}
    >
      {!!children ? children : "Add JSONs"}
    </UploadButton>
  );
};

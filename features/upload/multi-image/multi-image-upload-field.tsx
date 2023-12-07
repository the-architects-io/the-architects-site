import { BlueprintApiActions } from "@/app/blueprint/types";
import UploadButton from "@rpldy/upload-button";
import {
  Batch,
  useBatchAddListener,
  useBatchFinishListener,
  useUploady,
} from "@rpldy/uploady";
import { useEffect, useState } from "react";

export const MultiImageUploadField = ({
  driveAddress,
  children,
  setIsInProgress,
  setProgress,
  prefix,
}: {
  driveAddress: string;
  children: string | JSX.Element | JSX.Element[];
  setIsInProgress: (isInProgress: boolean) => void;
  setProgress: (progress: number) => void;
  prefix?: string;
}) => {
  const uploady = useUploady();

  const [batch, setBatch] = useState<Batch | null>(null);

  useBatchAddListener((batch: Batch) => {
    setBatch(batch);
    setIsInProgress(true);
  });

  useBatchFinishListener((batch: Batch) => {
    setIsInProgress(false);
  });

  useEffect(() => {
    if (!batch?.completed) return;

    if (batch?.completed > 0) {
      setProgress(Math.round((batch.completed / batch.total) * 100));
      console.log("completed amount", batch.completed);
    }
  }, [batch?.completed, batch?.total, setProgress]);

  return (
    <>
      <UploadButton
        grouped={true}
        maxGroupSize={10000}
        params={{
          action: BlueprintApiActions.UPLOAD_FILES,
          driveAddress,
          overwrite: true,
          prefix: prefix?.length ? `${prefix}-` : "",
        }}
      >
        {!!children ? children : "Add Images"}
      </UploadButton>
    </>
  );
};

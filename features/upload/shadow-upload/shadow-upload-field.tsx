import { createBlueprintClient } from "@/app/blueprint/client";
import { CollectionFileStats } from "@/app/blueprint/types";
import { inspectZipFile } from "@/app/blueprint/utils/files/zip";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { UploadStatus } from "@/features/upload/shadow-upload/upload-status";
import { GET_UPLOAD_JOB_BY_ID } from "@/graphql/queries/get-upload-job-by-id";
import { useQuery } from "@apollo/client";
import { useChunkStartListener } from "@rpldy/chunked-uploady";
import UploadButton from "@rpldy/upload-button";
import {
  UPLOADER_EVENTS,
  useBatchFinalizeListener,
  useRequestPreSend,
  useUploady,
} from "@rpldy/uploady";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Ensure you have 'uuid' installed

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const ShadowUploadField = ({
  children,
  setFileBeingUploaded,
  setUploadJobId,
  fileStats,
  fileBeingUploaded,
  setFileStats,
  onUploadComplete,
  params,
}: {
  children?: string | JSX.Element | JSX.Element[];
  setFileBeingUploaded: (file: File) => void;
  setUploadJobId: (id: string) => void;
  fileStats: CollectionFileStats | null;
  fileBeingUploaded: File | null;
  setFileStats: (stats: CollectionFileStats) => void;
  onUploadComplete?: (response: any) => void;
  params: {
    ownerAddress: string;
    driveAddress?: string;
    collectionId: string;
    shouldUnzip: boolean;
    userId: string;
  };
}) => {
  const uploady = useUploady();
  const fileUploadIdsRef = useRef<any>({}); // Store uploadIds for each file
  const jobIdRef = useRef<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const { loading, error, data } = useQuery(GET_UPLOAD_JOB_BY_ID, {
    variables: {
      id: jobIdRef.current,
    },
    skip: !jobIdRef.current,
    pollInterval: isComplete ? 0 : 500,
  });

  useRequestPreSend(async ({ items, options }) => {
    if (!isEnabled) {
      return {
        abort: true,
        cancel: true,
      };
    }
    debugger;
    setIsInProgress(true);
    const blueprint = createBlueprintClient({
      cluster: "devnet",
    });

    const sizeInBytes = items.reduce((acc, item) => {
      return acc + item.file.size;
    }, 0);

    if (!params.userId || !items?.[0].file) {
      throw new Error("No userId, cannot create job.");
    }

    const { success, job } = await blueprint.createUploadJob({
      driveAddress: params.driveAddress,
      sizeInBytes,
      userId: params.userId,
    });

    if (!success) {
      throw new Error("Failed to create upload job");
    }

    console.log("job", job);
    jobIdRef.current = job.id;
    setUploadJobId(job.id);

    return {
      options: {
        ...options, // Maintain existing options configuration
        params: {
          ...params, // Maintain existing params
          ...options.params, // Preserve existing params
          uploadJobId: job.id,
        },
      },
    };
  });

  useChunkStartListener(({ item, chunk, sendOptions }) => {
    const chunkIndex = chunk.index;
    const fileId = item.id;

    if (!fileUploadIdsRef.current[fileId]) {
      fileUploadIdsRef.current[fileId] = uuidv4(); // Generate a unique uploadId for each file
    }

    const uploadId = fileUploadIdsRef.current[fileId];

    const totalChunks = Math.ceil(item.file.size / CHUNK_SIZE);

    return {
      sendOptions: {
        ...sendOptions, // Maintain existing sendOptions configuration
        params: {
          ...params, // Maintain existing params
          ...sendOptions.params, // Preserve existing params
          chunkIndex,
          uploadId,
          totalChunks,
          uploadJobId: jobIdRef.current,
        },
      },
    };
  });

  useBatchFinalizeListener((batch) => {
    onUploadComplete?.(data.uploadJobs_by_pk);
    setTimeout(() => {
      setIsComplete(true);
      setIsInProgress(false);
    }, 1000);
  });

  const handleFileAdd = useCallback(
    async (file: File) => {
      try {
        const fileStats: CollectionFileStats = await inspectZipFile(file);
        setFileBeingUploaded(file);
        console.log("fileStats", fileStats);
        setFileStats(fileStats);
      } catch (error) {
        console.error("File inspection failed:", error);
        showToast({
          primaryMessage: "File inspection failed, invalid zip file",
        });
      }
    },
    [setFileBeingUploaded, setFileStats]
  );

  useEffect(() => {
    uploady.on(UPLOADER_EVENTS.BATCH_ADD, (batch) => {
      const file = batch.items[0].file;
      handleFileAdd(file);
    });

    return () => {
      uploady.off(UPLOADER_EVENTS.BATCH_ADD);
    };
  }, [handleFileAdd, uploady]);

  return (
    <>
      {isInProgress && (
        <div className="w-full flex justify-center mb-4">
          <Spinner />
        </div>
      )}
      {!!data?.uploadJobs_by_pk && <UploadStatus job={data.uploadJobs_by_pk} />}
      {!isComplete && !isInProgress && (
        <UploadButton className="underline">
          {!!children ? children : "Upload"}
        </UploadButton>
      )}
    </>
  );
};

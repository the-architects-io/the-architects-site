import { createBlueprintClient } from "@/app/blueprint/client";
import { CollectionFileStats, UploadJob } from "@/app/blueprint/types";
import { inspectZipFile } from "@/app/blueprint/utils/files/zip";
import Spinner from "@/features/UI/spinner";
import { JobIcons } from "@/features/jobs/job-icon";
import showToast from "@/features/toasts/show-toast";
import { UploadStatus } from "@/features/upload/shadow-upload/upload-status";
import { GET_UPLOAD_JOB_BY_ID } from "@/graphql/queries/get-upload-job-by-id";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import {
  CHUNK_EVENTS,
  ChunkStartEventData,
  createChunkedSender,
} from "@rpldy/chunked-sender";
import { useChunkStartListener } from "@rpldy/chunked-uploady";
import UploadButton from "@rpldy/upload-button";
import {
  Batch,
  CreateOptions,
  UPLOADER_EVENTS,
  UploadyContextType,
  useBatchFinalizeListener,
  useRequestPreSend,
  useUploady,
} from "@rpldy/uploady";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const ShadowUploadField = ({
  children,
  setFileBeingUploaded,
  setUploadJob,
  fileStats,
  fileBeingUploaded,
  isFileValid,
  uploadyInstance,
  setUploadyInstance,
  setFileStats,
  onUploadComplete,
  setShadowFileUploadId,
  uploadJob,
  params,
}: {
  children?: string | JSX.Element | JSX.Element[];
  setFileBeingUploaded: (file: File) => void;
  setUploadJob: (job: UploadJob) => void;
  fileStats: CollectionFileStats | null;
  isFileValid: boolean | null;
  uploadyInstance: UploadyContextType | null;
  setUploadyInstance: (instance: UploadyContextType) => void;
  fileBeingUploaded: File | null;
  setFileStats: (stats: CollectionFileStats) => void;
  onUploadComplete?: (response: any) => void;
  setShadowFileUploadId: (id: string) => void;
  uploadJob: UploadJob | null;
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
  const [isComplete, setIsComplete] = useState(false);
  const [isInProgress, setIsInProgress] = useState(false);
  const { cluster } = useCluster();

  const { loading, error, data } = useQuery(GET_UPLOAD_JOB_BY_ID, {
    variables: {
      id: uploadJob?.id,
    },
    skip: !uploadJob?.id,
    pollInterval: isComplete ? 0 : 500,
  });

  // useRequestPreSend(async ({ items, options }) => {
  //   debugger;
  //   if (!isFileValid) {
  //     showToast({
  //       primaryMessage: "Invalid file",
  //     });

  //     return {
  //       abort: true,
  //       cancel: true,
  //     };
  //   }
  //   setIsInProgress(true);
  //   const blueprint = createBlueprintClient({
  //     cluster: "devnet",
  //   });

  //   const sizeInBytes = items.reduce((acc, item) => {
  //     return acc + item.file.size;
  //   }, 0);

  //   if (!params.userId || !items?.[0].file || !uploadJobId) {
  //     throw new Error("Missing data, cannot create job.");
  //   }

  //   const { success, job } = await blueprint.updateUploadJob({
  //     id: uploadJobId,
  //     job: {
  //       percentComplete: 0,
  //       statusText: "Uploading assets to server...",
  //       sizeInBytes,
  //     },
  //   });

  //   if (!success) {
  //     throw new Error("Failed to update upload job");
  //   }

  //   return {
  //     options: {
  //       ...options, // Maintain existing options configuration
  //       params: {
  //         ...params, // Maintain existing params
  //         ...options.params, // Preserve existing params
  //         uploadJobId: job.id,
  //         driveAddress: params.driveAddress,
  //       },
  //     },
  //   };
  // });

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
    if (!uploadyInstance) {
      setUploadyInstance(uploady);
    }

    uploady.on(UPLOADER_EVENTS.BATCH_ADD, (batch) => {
      const file = batch.items[0].file;
      handleFileAdd(file);
    });

    uploady.on(
      UPLOADER_EVENTS.BATCH_START,
      async ({ items }: Batch, options: CreateOptions) => {
        const uploadJobId: string = options.params?.uploadJobId as string;
        console.log("BATCH_START", { items, options, uploadJobId });
        const fileId = items[0].id;

        const totalChunks = Math.ceil(items[0].file.size / CHUNK_SIZE);

        if (!fileUploadIdsRef.current[fileId]) {
          fileUploadIdsRef.current[fileId] = uuidv4(); // Generate a unique uploadId for each file
        }

        setIsInProgress(true);
        const blueprint = createBlueprintClient({
          cluster,
        });
        const sizeInBytes = items.reduce((acc, item) => {
          return acc + item.file.size;
        }, 0);
        if (!params.userId || !items?.[0].file || !uploadJobId) {
          console.error("Missing data, cannot create job.");
          return;
        }

        // need to debounce
        const { success, job } = await blueprint.jobs.updateUploadJob({
          id: uploadJobId,
          percentComplete: 0,
          statusText: "Uploading assets to server",
          sizeInBytes,
          icon: JobIcons.UPLOADING_FILES,
        });

        console.log("BATCH_START job", {
          success,
          job,
          uploadId: fileUploadIdsRef.current[items[0].id],
        });

        if (!success) {
          throw new Error("Failed to update upload job");
        }
        return {
          options: {
            ...options, // Maintain existing options configuration
            params: {
              ...params, // Maintain existing params
              ...options.params, // Preserve existing params,
              uploadId: fileUploadIdsRef.current[items[0].id],
              totalChunks,
              chunkIndex: 0,
            },
          },
        };
      }
    );

    uploady.on(
      CHUNK_EVENTS.CHUNK_START,
      ({ sendOptions, item, chunk }: ChunkStartEventData) => {
        console.log({ sendOptions, item, chunk });

        const chunkIndex = chunk.index;
        const fileId = item.id;

        if (!fileUploadIdsRef.current[fileId]) {
          fileUploadIdsRef.current[fileId] = uuidv4(); // Generate a unique uploadId for each file
        }

        const uploadId = fileUploadIdsRef.current[fileId];
        setShadowFileUploadId(uploadId);

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
            },
          },
        };
      }
    );

    return () => {
      uploady.off(UPLOADER_EVENTS.BATCH_ADD);
    };
  }, [
    cluster,
    handleFileAdd,
    isFileValid,
    params,
    setShadowFileUploadId,
    setUploadyInstance,
    uploadJob,
    uploady,
    uploadyInstance,
  ]);

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

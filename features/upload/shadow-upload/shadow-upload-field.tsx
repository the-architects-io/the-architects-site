import { createBlueprintClient } from "@/app/blueprint/client";
import { useChunkStartListener } from "@rpldy/chunked-uploady";
import UploadButton from "@rpldy/upload-button";
import {
  BatchItem,
  CreateOptions,
  UPLOADER_EVENTS,
  useRequestPreSend,
  useUploady,
} from "@rpldy/uploady";
import { useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Ensure you have 'uuid' installed

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const ShadowUploadField = ({
  children,
  setUploadJobId,
  params,
}: {
  children?: string | JSX.Element | JSX.Element[];
  setUploadJobId: (id: string) => void;
  params: {
    ownerAddress: string;
    driveAddress: string;
    collectionId: string;
    shouldUnzip: boolean;
    userId: string;
  };
}) => {
  const uploady = useUploady();
  const fileUploadIdsRef = useRef<any>({}); // Store uploadIds for each file
  const jobIdRef = useRef<string | null>(null);

  useRequestPreSend(async ({ items, options }) => {
    const blueprint = createBlueprintClient({
      cluster: "devnet",
    });

    const sizeInBytes = items.reduce((acc, item) => {
      return acc + item.file.size;
    }, 0);

    if (!params.userId) {
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

  // useMemo(
  //   () => ({
  //     [UPLOADER_EVENTS.REQUEST_PRE_SEND]: ({
  //       items,
  //       options,
  //     }: {
  //       items: BatchItem[];
  //       options: CreateOptions;
  //     }) => {
  //       return new Promise(async (resolve, reject) => {
  //         const blueprint = createBlueprintClient({
  //           cluster: "devnet",
  //         });

  //         const sizeInBytes = items.reduce((acc, item) => {
  //           return acc + item.file.size;
  //         }, 0);

  //         if (!params.userId) {
  //           return reject("No userId, cannot create job.");
  //         }

  //         const { success, job } = await blueprint.createUploadJob({
  //           driveAddress: params.driveAddress,
  //           sizeInBytes,
  //           userId: params.userId,
  //         });

  //         debugger;

  //         setUploadJobId(job.id);

  //         if (!success) {
  //           return reject("Failed to create upload job");
  //         }

  //         console.log("job", job);

  //         return resolve({
  //           options: {
  //             ...options, // Maintain existing options configuration
  //             params: {
  //               ...params, // Maintain existing params
  //               ...options.params, // Preserve existing params
  //               uploadJobId: job.id,
  //             },
  //           },
  //         });
  //       });
  //     },
  //   }),
  //   [params, setUploadJobId]
  // );

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

  return <UploadButton>{!!children ? children : "Upload"}</UploadButton>;
};

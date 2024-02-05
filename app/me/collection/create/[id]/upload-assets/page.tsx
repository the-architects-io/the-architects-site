"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import {
  BlueprintApiActions,
  Collection,
  CollectionFileStats,
  CollectionStatsFromCollectionMetadatas,
  StatusUUIDs,
  UploadFilesResponse,
  UploadJob,
  UploadJsonResponse,
} from "@/app/blueprint/types";
import {
  ARCHITECTS_API_URL,
  ASSET_SHDW_DRIVE_ADDRESS,
  EXECUTION_WALLET_ADDRESS,
  SHDW_DRIVE_BASE_URL,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { CreateCollectionAssetUploadChecklist } from "@/features/collection/create-collection-asset-upload-checklist";
import { JobIcons } from "@/features/jobs/job-icon";
import showToast from "@/features/toasts/show-toast";
import { JsonUpload } from "@/features/upload/json/json-upload";
import { JsonUploadMetadataValidation } from "@/features/upload/json/json-upload-metadata-validation";
import ShadowUpload from "@/features/upload/shadow-upload/shadow-upload";
import { ZipFileUploadValidation } from "@/features/upload/shadow-upload/zip-file-upload-validation";
import { JobStatus } from "@/features/jobs/job-status";
import {
  GET_COLLECTION_BY_ID,
  GET_UPLOAD_JOB_BY_ID,
} from "@the-architects/blueprint-graphql";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { UploadyContextType } from "@rpldy/uploady";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import { useRouter } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import { handleError } from "@/utils/errors/log-error";

export default function CollectionCreationUploadAssetsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const router = useRouter();
  const { cluster } = useCluster();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [zipFileBeingUploaded, setZipFileBeingUploaded] = useState<File | null>(
    null
  );
  const [collectionImagesUploadCount, setCollectionImagesUploadCount] =
    useState<number>(0);
  const [uploadJob, setUploadJob] = useState<UploadJob | null>(null);
  const [fileStats, setFileStats] = useState<CollectionFileStats | null>(null);
  const [isZipFileValid, setIsZipFileValid] = useState<boolean | null>(null);
  const [zipFileUploadyInstance, setZipFileUploadyInstance] =
    useState<UploadyContextType | null>(null);
  const [driveAddress, setDriveAddress] = useState<string | null>(null);
  const [hasStartedUpload, setHasStartedUpload] = useState<boolean>(false);
  const [
    hasSavedDriveAddressToCollection,
    setHasSavedDriveAddressToCollection,
  ] = useState<boolean>(false);
  const [tokenCount, setTokenCount] = useState<number>(0);

  const wallet = useWallet();
  const blueprint = createBlueprintClient({
    cluster,
  });

  const [collection, setCollection] = useState<Collection | null>(null);

  const { error, data } = useQuery(GET_UPLOAD_JOB_BY_ID, {
    variables: {
      id: collection?.uploadJob?.id || uploadJob?.id,
    },
    skip: !collection?.uploadJob?.id && !uploadJob?.id,
    onCompleted: ({ uploadJobs_by_pk }) => {
      setUploadJob(uploadJobs_by_pk);
    },
  });

  const { loading, data: collectionData } = useQuery(GET_COLLECTION_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    fetchPolicy: "no-cache",
    onCompleted: ({
      collections_by_pk: collection,
    }: {
      collections_by_pk: Collection;
    }) => {
      console.log({ collection });
      setCollection(collection);

      if (collection?.uploadJob?.id) {
        setUploadJob(collection.uploadJob);
      }
      setTokenCount(collection.tokenCount);
    },
  });

  const handleCollectionImagesCompleted = useCallback(
    async (res: UploadFilesResponse) => {
      if (!res.success) {
        showToast({
          primaryMessage: "Collection Images Upload Failed",
        });
        return;
      }
      if (!res.count) return;
      setCollectionImagesUploadCount(res.count);
    },
    []
  );

  const handleUploadClick = async () => {
    if (!zipFileUploadyInstance || !user?.id || !collection?.id) {
      throw new Error("Missing required data");
    }

    if (hasStartedUpload) return;

    setHasStartedUpload(true);
    setIsSubmitting(true);

    const collectionImageSizeInBytes = collection.imageSizeInBytes || 0;
    const zipFileSizeInBytes = fileStats?.totalUncompressedSize || 0;

    const sizeInBytes = zipFileSizeInBytes + collectionImageSizeInBytes;
    let sizeInKb = sizeInBytes ? sizeInBytes / 1000 : 0;
    sizeInKb += 1000; // add 1MB to sizeInKb for overhead

    const { job } = await blueprint.jobs.createUploadJob({
      statusText: "Creating SHDW Drive",
      userId: user?.id,
      icon: JobIcons.CREATING_SHADOW_DRIVE,
      cluster,
    });

    setUploadJob(job);

    await blueprint.collections.updateCollection({
      id: params.id,
      uploadJobId: job.id,
    });

    let driveAddress: string | null = null;

    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, status } = await axios.post(
          `${ARCHITECTS_API_URL}/create-drive`,
          {
            name: params.id,
            sizeInKb,
            ownerAddress: EXECUTION_WALLET_ADDRESS,
          }
        );

        if (status !== 200) {
          throw new Error("Failed to create drive");
        }

        const { address, txSig } = data;

        console.log({ address, txSig });

        setDriveAddress(address);
        driveAddress = address;

        break;
      } catch (error) {
        if (attempt === maxRetries) {
          console.log({ error });
          showToast({
            primaryMessage: "Failed to create drive",
          });
          blueprint.jobs.updateUploadJob({
            id: job.id,
            statusId: StatusUUIDs.ERROR,
            statusText: "Failed to create drive.",
            cluster,
          });
          handleError(error as Error);
          throw error;
        }
        console.error(`Attempt ${attempt} failed: ${error}`);
      }
    }

    console.log({ collection });

    if (!collection.imageUrl?.length) {
      blueprint.jobs.updateUploadJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Collection image is missing",
        cluster,
      });
      return;
    }

    if (!driveAddress) {
      blueprint.jobs.updateUploadJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Drive address is missing",
        cluster,
      });
      return;
    }

    const response = await fetch(collection.imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert the response to an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Convert the ArrayBuffer to a Blob
    const blob = new Blob([arrayBuffer], { type: "image/png" });

    const fileName = "collection.png";

    // Convert the Blob to a File object
    const file = new File([blob], fileName, { type: "image/png" });

    await blueprint.jobs.updateUploadJob({
      id: job.id,
      statusText: "Transferring collection image",
      icon: JobIcons.COLLECTION_IMAGE,
      cluster,
    });

    const { success: imageUploadSuccess, url } =
      await blueprint.upload.uploadFile({
        file,
        fileName,
        driveAddress,
      });

    if (!imageUploadSuccess) {
      blueprint.jobs.updateUploadJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "Failed to transfer collection image",
        cluster,
      });

      return;
    }

    if (!zipFileBeingUploaded || !driveAddress) {
      blueprint.jobs.updateUploadJob({
        id: job.id,
        statusId: StatusUUIDs.ERROR,
        statusText: "An unexpected error occurred.",
        cluster,
      });
      throw new Error("Missing files or drive address");
    }

    const exisitingOptions = zipFileUploadyInstance.getOptions();

    console.log({ exisitingOptions });

    const newParams = {
      ...exisitingOptions.params,
      driveAddress,
      uploadJobId: job.id,
      ownerAddress: EXECUTION_WALLET_ADDRESS,
      collectionId: params.id,
      shouldUnzip: true,
      userId: user?.id,
    };

    console.log({ newParams });

    zipFileUploadyInstance.processPending({
      params: newParams,
    });
  };

  useEffect(() => {
    if (!params.id) {
      router.push("/me/collection");
    }
  }, [params.id, router]);

  useEffect(() => {
    if (uploadJob && driveAddress && !hasSavedDriveAddressToCollection) {
      blueprint.collections.updateCollection({
        imageUrl: `${SHDW_DRIVE_BASE_URL}/${driveAddress}/collection.png`,
        id: params.id,
        uploadJobId: uploadJob.id,
        driveAddress,
      });
      setHasSavedDriveAddressToCollection(true);
    }
  }, [
    uploadJob,
    blueprint,
    params.id,
    driveAddress,
    hasSavedDriveAddressToCollection,
  ]);

  if (loading) {
    return (
      <div className="py-4 flex w-full justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ContentWrapper>
      {!!uploadJob ? (
        <ContentWrapperYAxisCenteredContent>
          <JobStatus
            collectionId={params.id}
            jobId={uploadJob.id}
            setJob={setUploadJob}
            zipFileUploadyInstance={zipFileUploadyInstance}
          />
        </ContentWrapperYAxisCenteredContent>
      ) : (
        <>
          <div className="flex space-x-8">
            <div className="w-1/3 max-w-[500px]">
              <CreateCollectionAssetUploadChecklist
                tokenCount={tokenCount}
                fileStats={fileStats}
              />
            </div>
            <div className="flex flex-col justify-center items-center w-full mb-8 space-y-4">
              <div
                className={classNames([
                  "border rounded-lg px-4 w-full mb-4 flex flex-col items-center justify-center p-8 min-h-[28vh]",
                  !!collectionImagesUploadCount
                    ? "border-green-500 bg-green-500 bg-opacity-10"
                    : "border-gray-600",
                ])}
              >
                {!!fileStats?.files?.length && !!zipFileBeingUploaded ? (
                  <ZipFileUploadValidation
                    uploadyInstance={zipFileUploadyInstance}
                    fileStats={fileStats}
                    setFileStats={setFileStats}
                    setFileBeingUploaded={setZipFileBeingUploaded}
                    isFileValid={isZipFileValid}
                    setIsFileValid={setIsZipFileValid}
                  />
                ) : (
                  <>
                    {!!user?.id && !!params?.id && (
                      <ShadowUpload
                        uploadJob={uploadJob}
                        setShadowFileUploadId={() => {}}
                        isFileValid={isZipFileValid}
                        uploadyInstance={zipFileUploadyInstance}
                        setUploadyInstance={setZipFileUploadyInstance}
                        fileStats={fileStats}
                        fileBeingUploaded={zipFileBeingUploaded}
                        ownerAddress={EXECUTION_WALLET_ADDRESS}
                        onUploadComplete={handleCollectionImagesCompleted}
                        collectionId={params.id}
                        shouldUnzip={true}
                        userId={user?.id}
                        setUploadJob={setUploadJob}
                        setFileStats={setFileStats}
                        setFileBeingUploaded={setZipFileBeingUploaded}
                        accept=".zip"
                      >
                        Add Collection Images Zip File
                      </ShadowUpload>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <div className="fixed bottom-4 w-full px-8">
              <SubmitButton
                isSubmitting={isSubmitting}
                className="w-full"
                onClick={handleUploadClick}
                disabled={
                  !isZipFileValid || fileStats?.files.length !== tokenCount
                }
              >
                Upload Assets
              </SubmitButton>
            </div>
          </div>
        </>
      )}
    </ContentWrapper>
  );
}

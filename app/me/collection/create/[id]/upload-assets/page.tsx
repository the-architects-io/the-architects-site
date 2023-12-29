"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import {
  BlueprintApiActions,
  Collection,
  CollectionFileStats,
  CollectionStatsFromCollectionMetadatas,
  Creator,
  UploadFilesResponse,
  UploadJob,
  UploadJobStatus,
  UploadJsonResponse,
} from "@/app/blueprint/types";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  EXECUTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { CreateCollectionAssetUploadChecklist } from "@/features/collection/create-collection-asset-upload-checklist";
import showToast from "@/features/toasts/show-toast";
import { JsonUpload } from "@/features/upload/json/json-upload";
import { JsonUploadMetadataValidation } from "@/features/upload/json/json-upload-metadata-validation";
import ShadowUpload from "@/features/upload/shadow-upload/shadow-upload";
import { ZipFileUploadValidation } from "@/features/upload/shadow-upload/zip-file-upload-validation";
import { UploadStatus } from "@/features/upload/status/upload-status";
import { GET_COLLECTION_BY_ID } from "@/graphql/queries/get-collection-by-id";
import { GET_UPLOAD_JOB_BY_ID } from "@/graphql/queries/get-upload-job-by-id";
import { useQuery } from "@apollo/client";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";
import { CHUNK_EVENTS, ChunkStartEventData } from "@rpldy/chunked-sender";
import { BatchItem, UploadyContextType } from "@rpldy/uploady";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import { useRouter } from "next/navigation";

import { useCallback, useEffect, useRef, useState } from "react";

export default function CollectionCreationUploadAssetsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const router = useRouter();

  const [shadowFileUploadId, setShadowFileUploadId] = useState<string | null>(
    null
  );
  const [collectionMetadataStats, setCollectionMetadataStats] =
    useState<CollectionStatsFromCollectionMetadatas | null>(null);
  const [
    collectionMetadatasJsonUploadResponse,
    setCollectionMetadatasJsonUploadResponse,
  ] = useState<UploadJsonResponse | null>(null);
  const [jsonBeingUploaded, setJsonBeingUploaded] = useState<any | null>(null);
  const [jsonFileBeingUploaded, setJsonFileBeingUploaded] =
    useState<File | null>(null);
  const [zipFileBeingUploaded, setZipFileBeingUploaded] = useState<File | null>(
    null
  );
  const [collectionImagesUploadCount, setCollectionImagesUploadCount] =
    useState<number>(0);
  const [uploadJob, setUploadJob] = useState<UploadJob | null>(null);
  const [fileStats, setFileStats] = useState<CollectionFileStats | null>(null);
  const [isZipFileValid, setIsZipFileValid] = useState<boolean | null>(null);
  const [isMetadataValid, setIsMetadataValid] = useState<boolean | null>(null);
  const [jsonUploadyInstance, setJsonUploadyInstance] =
    useState<UploadyContextType | null>(null);
  const [zipFileUploadyInstance, setZipFileUploadyInstance] =
    useState<UploadyContextType | null>(null);

  const wallet = useWallet();
  const blueprint = createBlueprintClient({
    cluster: "devnet",
  });

  const [collection, setCollection] = useState<Collection | null>(null);

  const { error, data } = useQuery(GET_UPLOAD_JOB_BY_ID, {
    variables: {
      id: collection?.uploadJob?.id || uploadJob?.id,
    },
    skip: !collection?.uploadJob?.id && !uploadJob?.id,
    pollInterval: 500,
    onCompleted: ({ uploadJobs_by_pk }) => {
      setUploadJob(uploadJobs_by_pk);
    },
  });

  const { loading } = useQuery(GET_COLLECTION_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
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
    },
  });

  // ** Move this to mint during airdrop **
  // const driveAddress = ASSET_SHDW_DRIVE_ADDRESS;
  // const basisPoints = sellerFeeBasisPoints * 100;

  // let uri = "";

  // try {
  //   const { url } = await blueprint.uploadJson({
  //     json: {
  //       name: collectionName,
  //       symbol,
  //       description,
  //       seller_fee_basis_points: basisPoints,
  //       image: `${getShdwDriveUrl(driveAddress)}/${getSlug(
  //         collectionName
  //       )}-collection.png`,
  //     },
  //     fileName: `${collectionName.split(" ").join("-")}-collection.json`,
  //     driveAddress,
  //   });

  //   uri = url;
  // } catch (error) {
  //   console.log({ error });
  // }

  // try {
  //   console.log({ collectionName, uri, sellerFeeBasisPoints });

  //   const { success, mintAddress } = await blueprint.mintNft({
  //     name: collectionName,
  //     uri,
  //     sellerFeeBasisPoints: basisPoints,
  //     isCollection: true,
  //   });

  //   if (!success) {
  //     showToast({
  //       primaryMessage: "Collection NFT Mint Failed",
  //     });
  //     return;
  //   }

  //   showToast({
  //     primaryMessage: "Collection NFT Minted",
  //     link: {
  //       title: "View NFT",
  //       url: `https://solscan.io/token/${mintAddress}`,
  //     },
  //   });
  // } catch (error) {
  //   console.log({ error });
  // }

  const handleMetadataJsonUploadComplete = useCallback(
    async ({ url, success }: UploadJsonResponse) => {
      if (!success) {
        showToast({
          primaryMessage: "Collection Metadata JSON Upload Failed",
        });
        return;
      }

      const { data } = await axios.get(url);

      setCollectionMetadatasJsonUploadResponse(data);
    },
    []
  );

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
    if (!zipFileUploadyInstance || !jsonUploadyInstance || !user?.id) {
      throw new Error("Missing uploady instance");
    }

    const sizeInBytes = fileStats?.totalUncompressedSize;
    let sizeInKb = sizeInBytes ? sizeInBytes / 1000 : 0;
    sizeInKb += 1000; // add 1MB to sizeInKb for overhead

    let driveAddress = "Fr7aiy6QAH9N9gCsyc8jqTWLxL1o9Y7ghVMEQuakWp8q";

    const { job } = await blueprint.createUploadJob({
      statusText: "Creating SHDW drive...",
      userId: user?.id,
    });

    setUploadJob(job);

    await blueprint.updateCollection({
      id: params.id,
      uploadJobId: job.id,
    });

    // try {
    //   const { address } = await blueprint.createDrive({
    //     name: params.id,
    //     sizeInKb,
    //     ownerAddress: EXECUTION_WALLET_ADDRESS,
    //   });
    //   driveAddress = address;
    // } catch (error) {
    //   console.log({ error });
    //   showToast({
    //     primaryMessage: "Failed to create drive",
    //   });
    //   throw new Error("Failed to create drive");
    // }

    console.log({
      zipFileUploadyInstance,
      jsonUploadyInstance,
      jsonBeingUploaded,
      zipFileBeingUploaded,
    });

    if (!zipFileBeingUploaded || !jsonBeingUploaded) {
      throw new Error("Missing files");
    }

    // jsonUploadyInstance.processPending({
    //   params: {
    //     driveAddress,
    //     uploadJobId: job.id,
    //     action: BlueprintApiActions.UPLOAD_JSON,
    //     fileName: `${params.id}-collection-metadatas.json`,
    //     overwrite: true,
    //     userId: user?.id,
    //     uploadId: shadowFileUploadId,
    //     collectionId: params.id,
    //   },
    // });

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
      uploadId: shadowFileUploadId,
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
    if (uploadJob) {
      blueprint.updateCollection({
        id: params.id,
        uploadJobId: uploadJob.id,
      });
    }
  }, [uploadJob, blueprint, params.id]);

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
        <div className="pt-16">
          <UploadStatus job={uploadJob} setJob={setUploadJob} />
        </div>
      ) : (
        <>
          <div className="flex space-x-8">
            <div className="w-1/3 max-w-[500px]">
              <CreateCollectionAssetUploadChecklist
                metadataStats={collectionMetadataStats}
                fileStats={fileStats}
              />
            </div>
            <div className="flex flex-col justify-center items-center w-full mb-8 space-y-4">
              <div
                className={classNames([
                  "border rounded-lg px-4 w-full mb-4 flex flex-col items-center justify-center p-8 min-h-[28vh]",
                  !!collectionMetadataStats &&
                  !!collectionMetadatasJsonUploadResponse
                    ? "border-green-500 bg-green-500 bg-opacity-10"
                    : "border-gray-600",
                ])}
              >
                {!!collectionMetadataStats &&
                !!collectionMetadatasJsonUploadResponse ? (
                  <div className="flex flex-col items-center">
                    <div className="text-green-500 flex items-center gap-x-2 mb-4">
                      <CheckBadgeIcon className="h-5 w-5" />
                      <div>Token Metadatas Added</div>
                    </div>
                    <p className="text-gray-100 text-lg mb-2">
                      {collectionMetadataStats.count} token metadatas
                    </p>
                    <div className="text-gray-100 text-lg mb-2 text-center">
                      <div>
                        {collectionMetadataStats.uniqueTraits.length} unique
                        traits across collection
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {!!jsonBeingUploaded ? (
                      <div className="mt-4">
                        <JsonUploadMetadataValidation
                          json={jsonBeingUploaded}
                          isMetadataValid={isMetadataValid}
                          setIsMetadataValid={setIsMetadataValid}
                          setMetadataStas={setCollectionMetadataStats}
                          setJsonBeingUploaded={setJsonBeingUploaded}
                        />
                      </div>
                    ) : (
                      <JsonUpload
                        isFileValid={isMetadataValid}
                        uploadyInstance={jsonUploadyInstance}
                        setUploadyInstance={setJsonUploadyInstance}
                        setJsonFileBeingUploaded={setJsonFileBeingUploaded}
                        setJsonBeingUploaded={setJsonBeingUploaded}
                        setJsonUploadResponse={handleMetadataJsonUploadComplete}
                        driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
                        fileName={`${params.id}-collection-metadatas.json`}
                      >
                        Add Collection Metadata JSONs
                      </JsonUpload>
                    )}
                  </div>
                )}
              </div>
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
                        setShadowFileUploadId={setShadowFileUploadId}
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
                isSubmitting={false}
                className="w-full"
                onClick={handleUploadClick}
                disabled={!isMetadataValid || !isZipFileValid}
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

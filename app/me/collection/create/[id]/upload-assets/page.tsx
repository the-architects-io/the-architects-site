"use client";
import {
  CollectionFileStats,
  CollectionStatsFromCollectionMetadatas,
  Creator,
  UploadFilesResponse,
  UploadJsonResponse,
} from "@/app/blueprint/types";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  EXECUTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { CreateCollectionAssetUploadChecklist } from "@/features/collection/create-collection-asset-upload-checklist";
import showToast from "@/features/toasts/show-toast";
import { JsonUpload } from "@/features/upload/json/json-upload";
import { JsonUploadMetadataValidation } from "@/features/upload/json/json-upload-metadata-validation";
import ShadowUpload from "@/features/upload/shadow-upload/shadow-upload";
import { ZipFileUploadValidation } from "@/features/upload/shadow-upload/zip-file-upload-validation";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import { useRouter } from "next/navigation";

import { useCallback, useEffect, useState } from "react";

export default function CollectionCreationUploadAssetsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const router = useRouter();

  const [collectionMetadataStats, setCollectionMetadataStats] =
    useState<CollectionStatsFromCollectionMetadatas | null>(null);
  const [
    collectionMetadatasJsonUploadResponse,
    setCollectionMetadatasJsonUploadResponse,
  ] = useState<UploadJsonResponse | null>(null);
  const [jsonBeingUploaded, setJsonBeingUploaded] = useState<any | null>(null);
  const [zipFileBeingUploaded, setZipFileBeingUploaded] = useState<File | null>(
    null
  );
  const [collectionImagesUploadCount, setCollectionImagesUploadCount] =
    useState<number>(0);
  const [uploadJobId, setUploadJobId] = useState<string | null>(null);
  const [fileStats, setFileStats] = useState<CollectionFileStats | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);

  const wallet = useWallet();

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

  useEffect(() => {
    if (!params.id) {
      router.push("/me/collection");
    }
  }, [params.id, router]);

  return (
    <ContentWrapper>
      {uploadInProgress ? (
        <></>
      ) : (
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
                        setMetadataStas={setCollectionMetadataStats}
                        json={jsonBeingUploaded}
                        setJsonBeingUploaded={setJsonBeingUploaded}
                      />
                    </div>
                  ) : (
                    <JsonUpload
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
                />
              ) : (
                <>
                  {!!user?.id && !!params?.id && (
                    <ShadowUpload
                      fileStats={fileStats}
                      fileBeingUploaded={zipFileBeingUploaded}
                      ownerAddress={EXECUTION_WALLET_ADDRESS}
                      onUploadComplete={handleCollectionImagesCompleted}
                      collectionId={params.id}
                      shouldUnzip={true}
                      userId={user?.id}
                      setUploadJobId={setUploadJobId}
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
      )}
    </ContentWrapper>
  );
}

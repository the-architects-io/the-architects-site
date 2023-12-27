"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import {
  Creator,
  UploadFilesResponse,
  UploadJsonResponse,
} from "@/app/blueprint/types";
import { CollectionStatsFromCollectionMetadatas } from "@/app/blueprint/utils";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  EXECUTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { JsonUpload } from "@/features/upload/json/json-upload";
import { JsonUploadMetadataValidation } from "@/features/upload/json/json-upload-metadata-validation";
import ShadowUpload from "@/features/upload/shadow-upload/shadow-upload";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useUserData } from "@nhost/nextjs";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import classNames from "classnames";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";

import { useCallback, useEffect, useState } from "react";

export default function CollectionCreationUploadAssetsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const router = useRouter();
  const [isSavingCollection, setIsSavingCollection] = useState(false);
  const [collectionMetadataStats, setCollectionMetadataStats] =
    useState<CollectionStatsFromCollectionMetadatas | null>(null);
  const [
    collectionMetadatasJsonUploadResponse,
    setCollectionMetadatasJsonUploadResponse,
  ] = useState<UploadJsonResponse | null>(null);
  const [jsonBeingUploaded, setJsonBeingUploaded] = useState<any | null>(null);
  const [collectionImagesUploadCount, setCollectionImagesUploadCount] =
    useState<number>(0);
  const [uploadJobId, setUploadJobId] = useState<string | null>(null);

  const wallet = useWallet();
  const formik = useFormik({
    initialValues: {
      collectionName: "",
      symbol: "",
      description: "",
      sellerFeeBasisPoints: 0,
      iamge: "",
      creators: [{ address: "", share: 0, sortOrder: 0, id: 0 }] as Creator[],
    },
    onSubmit: async ({}) => {
      if (!wallet?.publicKey) {
        showToast({
          primaryMessage: "Collection Upload Failed",
        });
        return;
      }

      setIsSavingCollection(true);

      const blueprint = createBlueprintClient({
        cluster: "devnet",
      });

      const { success } = await blueprint.updateCollection({
        id: params.id,
        isReadyToMint: true,
      });

      if (!success) {
        showToast({
          primaryMessage: "Saving collection failed",
        });
        return;
      }

      showToast({
        primaryMessage: "Collection saved",
      });

      setIsSavingCollection(false);

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
    },
  });

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
      <div className="flex flex-col justify-center items-center w-full mb-8 space-y-4">
        <div
          className={classNames([
            "border rounded-lg px-4 w-full mb-4 flex flex-col items-center justify-center p-8 min-h-[28vh]",
            !!collectionMetadataStats && !!collectionMetadatasJsonUploadResponse
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
                  {collectionMetadataStats.uniqueTraits.length} unique traits
                  across collection
                </div>
              </div>
            </div>
          ) : (
            <div>
              {!!jsonBeingUploaded ? (
                <div className="mt-4">
                  <JsonUploadMetadataValidation
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
          {!!collectionImagesUploadCount ? (
            <div className="flex flex-col items-center">
              <div className="text-green-500 flex items-center gap-x-2 mb-4">
                <CheckBadgeIcon className="h-5 w-5" />
                <div>Collection Images Added</div>
              </div>
              <p className="text-gray-100 text-lg mb-2">
                {collectionImagesUploadCount} collection images
              </p>
            </div>
          ) : (
            <>
              {!!user?.id && !!params?.id && (
                <ShadowUpload
                  ownerAddress={EXECUTION_WALLET_ADDRESS}
                  onUploadComplete={handleCollectionImagesCompleted}
                  collectionId={params.id}
                  shouldUnzip={true}
                  userId={user?.id}
                  setUploadJobId={setUploadJobId}
                  // only zip files
                  accept=".zip"
                >
                  Add Collection Images Zip File
                </ShadowUpload>
              )}
            </>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
}

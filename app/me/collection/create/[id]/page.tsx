"use client";
import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import CreateCollectionForm from "@/features/nft-collections/create-collection-form";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { JsonUpload } from "@/features/upload/json/json-upload";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import { MultiImageUpload } from "@/features/upload/multi-image/multi-image-upload";
import { UploadJsonFileToShadowDriveResponse } from "@/app/api/upload-json-file-to-shadow-drive/route";
import {
  CollectionStatsFromCollectionMetadatas,
  getCollectionStatsFromCollectionMetadatas,
  isValidCollectionMetadatas,
} from "@/app/blueprint/utils";
import { useQuery } from "@apollo/client";
import { GET_COLLECTION_BY_ID } from "@/graphql/queries/get-collection-by-id";
import { Collection } from "@/app/blueprint/types";
import { useUserData } from "@nhost/nextjs";
import { isUuid } from "uuidv4";

export default function CreateCollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const wallet = useWallet();
  const router = useRouter();
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [airdropId, setAirdropId] = useState<string | null>(null);
  const [sellerFeeBasisPoints, setSellerFeeBasisPoints] = useState<
    number | null
  >(null);
  const [collectionNftAddress, setCollectionNftAddress] = useState<
    string | null
  >(null);

  const [image, setImage] = useState<File | null>(null);
  const [collectionImages, setCollectionImages] = useState<FileList | null>(
    null
  );
  const [jsonUploadResponse, setJsonUploadResponse] =
    useState<UploadJsonFileToShadowDriveResponse | null>(null);
  const [collectionMetadataStats, setCollectionMetadataStats] =
    useState<CollectionStatsFromCollectionMetadatas | null>(null);

  const { loading } = useQuery(GET_COLLECTION_BY_ID, {
    skip: !params?.id || !isUuid(params?.id),
    variables: { id: params?.id },
    onCompleted: ({
      collections_by_pk: collection,
    }: {
      collections_by_pk: Collection;
    }) => {
      if (!collection || collection.owner.id !== user?.id) {
        router.push("/me/collection");
      } else {
        setCollectionId(collection.id);
      }
    },
  });

  useEffect(() => {
    if (!params?.id || !isUuid(params?.id)) {
      debugger;
      router.push("/me/collection");
      return;
    }
    if (jsonUploadResponse) {
      console.log("jsonUploadResponse", jsonUploadResponse.count);
      if (isValidCollectionMetadatas(jsonUploadResponse)) {
        setCollectionMetadataStats(
          getCollectionStatsFromCollectionMetadatas(jsonUploadResponse)
        );
      }
    }
  }, [jsonUploadResponse, params?.id, router]);

  if (!wallet.publicKey) {
    return (
      <ContentWrapper>
        <div className="flex flex-col items-center pt-8">
          <p className="text-gray-100 text-lg mb-8">
            Please connect your wallet to continue.
          </p>
          <WalletButton />
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className="w-full flex">
        <div className="flex flex-col items-center mb-16 w-full md:w-[500px]">
          <SingleImageUpload
            fileName="test"
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
          >
            Add Collection Image
          </SingleImageUpload>
          <CreateCollectionForm
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
            setSellerFeeBasisPoints={setSellerFeeBasisPoints}
            setCollectionNftAddress={setCollectionNftAddress}
          />
        </div>
        <div className="flex flex-col items-center w-full px-8">
          <div className="border border-gray-600 rounded-lg py-12 px-4 w-full min-h-[38vh] mb-4 flex flex-col items-center justify-center">
            {!!collectionMetadataStats ? (
              <div className="flex flex-col items-center">
                <p className="text-gray-100 text-lg mb-4">
                  {collectionMetadataStats.count} NFTs
                </p>
                <p className="text-gray-100 text-lg mb-4">
                  {collectionMetadataStats.uniqueTraits} Unique Traits
                </p>
                <p className="text-gray-100 text-lg mb-4">
                  {collectionMetadataStats.creators.length} Creators
                </p>
              </div>
            ) : (
              <JsonUpload
                setJsonUploadResponse={setJsonUploadResponse}
                driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
                fileName="test-collection-metas.json"
              >
                Add Collection Metadata JSONs
              </JsonUpload>
            )}
          </div>
          <MultiImageUpload driveAddress={ASSET_SHDW_DRIVE_ADDRESS}>
            Add Collection Images
          </MultiImageUpload>
        </div>
      </div>
    </ContentWrapper>
  );
}

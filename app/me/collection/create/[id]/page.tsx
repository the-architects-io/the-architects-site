"use client";
import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { Collection, Creator } from "@/app/blueprint/types";
import { useUserData } from "@nhost/nextjs";
import { isUuid } from "uuidv4";
import { useFormik } from "formik";
import { getAbbreviatedAddress, getSlug } from "@/utils/formatting";
import { createBlueprintClient } from "@/app/blueprint/client";
import { getShdwDriveUrl } from "@/utils/drive";
import showToast from "@/features/toasts/show-toast";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { DndCard } from "@/features/UI/dnd-card";
import Spinner from "@/features/UI/spinner";

export default function CreateCollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const wallet = useWallet();
  const router = useRouter();
  const [collectionId, setCollectionId] = useState<string | null>(params?.id);
  const [jsonUploadResponse, setJsonUploadResponse] =
    useState<UploadJsonFileToShadowDriveResponse | null>(null);
  const [collectionMetadataStats, setCollectionMetadataStats] =
    useState<CollectionStatsFromCollectionMetadatas | null>(null);
  const [collectionImage, setCollectionImage] = useState<File | null>(null);
  const [creators, setCreators] = useState<Creator[] | null>(null);

  const formik = useFormik({
    initialValues: {
      collectionName: "",
      symbol: "",
      description: "",
      sellerFeeBasisPoints: 0,
      iamge: "",
      creators: [] as Creator[],
    },
    onSubmit: async ({
      collectionName,
      symbol,
      description,
      sellerFeeBasisPoints,
    }) => {
      if (!wallet?.publicKey) return;
      if (!collectionImage) return;

      const blueprint = createBlueprintClient({
        cluster: "devnet",
      });

      const driveAddress = ASSET_SHDW_DRIVE_ADDRESS;
      const basisPoints = sellerFeeBasisPoints * 100;

      let uri = "";

      try {
        const { url } = await blueprint.uploadJson({
          json: {
            name: collectionName,
            symbol,
            description,
            seller_fee_basis_points: basisPoints,
            image: `${getShdwDriveUrl(driveAddress)}/${getSlug(
              collectionName
            )}-collection.png`,
          },
          fileName: `${collectionName.split(" ").join("-")}-collection.json`,
          driveAddress,
        });

        uri = url;
      } catch (error) {
        console.log({ error });
      }

      try {
        console.log({ collectionName, uri, sellerFeeBasisPoints });

        const { success, mintAddress } = await blueprint.mintNft({
          name: collectionName,
          uri,
          sellerFeeBasisPoints: basisPoints,
          isCollection: true,
        });

        if (!success) {
          showToast({
            primaryMessage: "Collection NFT Mint Failed",
          });
          return;
        }

        showToast({
          primaryMessage: "Collection NFT Minted",
          link: {
            title: "View NFT",
            url: `https://solscan.io/token/${mintAddress}`,
          },
        });
      } catch (error) {
        console.log({ error });
      }
    },
  });

  const { loading } = useQuery(GET_COLLECTION_BY_ID, {
    skip: !params?.id || !isUuid(params?.id) || !user?.id,
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
        setCreators(collection.creators);
      }
    },
  });

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      formik.setFieldValue(
        "creators",
        formik.values.creators.map((creator, index) => {
          if (index === dragIndex) {
            return { ...creator, share: hoverIndex };
          }
          if (index === hoverIndex) {
            return { ...creator, share: dragIndex };
          }
          return creator;
        })
      );
    },
    [formik]
  );

  useEffect(() => {
    if (!params?.id || !isUuid(params?.id)) {
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

    if (creators?.length && formik.values.creators.length === 0) {
      formik.setFieldValue("creators", creators);
    }
  }, [jsonUploadResponse, params?.id, router, creators, formik]);

  if (loading) {
    return (
      <ContentWrapper>
        <div className="flex flex-col items-center mb-16">
          <div className="my-16">
            <Spinner />
          </div>
        </div>
      </ContentWrapper>
    );
  }

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
          {/* <SingleImageUpload
            fileName={`${collectionId}-collection.png}`}
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
            setImage={setCollectionImage}
          >
            Add Collection Image
          </SingleImageUpload> */}
          <div className="flex flex-col justify-center items-center w-full mb-4 space-y-4">
            <FormInputWithLabel
              label="Collection Name"
              name="collectionName"
              placeholder="Collection Name"
              onChange={formik.handleChange}
              value={formik.values.collectionName}
            />
            <FormInputWithLabel
              label="Symbol"
              name="symbol"
              placeholder="Symbol"
              onChange={formik.handleChange}
              value={formik.values.symbol}
            />
            <FormInputWithLabel
              label="Seller Fee Basis Points (in %)"
              name="sellerFeeBasisPoints"
              type="number"
              min={0}
              max={100}
              placeholder="Seller Fee Basis Points"
              onChange={formik.handleChange}
              value={formik.values.sellerFeeBasisPoints}
            />
            <FormTextareaWithLabel
              label="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        <div className="flex flex-col items-center w-full px-8">
          <div className="border border-gray-600 rounded-lg px-4 w-full mb-4 flex flex-col items-center justify-center p-8">
            <div className="text-lg mb-4">Creators</div>
            <>
              <DndProvider backend={HTML5Backend}>
                {formik.values.creators.map(({ address, share }, index) => (
                  <DndCard
                    key={address.toString()}
                    id={address.toString()}
                    index={index}
                    moveCard={moveCard}
                  >
                    <div className="flex items-center overflow-hidden space-x-4">
                      <div className="flex space-x-2">
                        <div>Address:</div>
                        <div>{getAbbreviatedAddress(address)}</div>
                      </div>
                      <div className="flex space-x-2">
                        <div>Share:</div>
                        <div>{share}%</div>
                      </div>
                    </div>
                  </DndCard>
                ))}
              </DndProvider>
            </>
          </div>
          <div className="border border-gray-600 rounded-lg px-4 w-full min-h-[28vh] mb-4 flex flex-col items-center justify-center">
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
          <div className="border border-gray-600 rounded-lg px-4 w-full min-h-[28vh] mb-4 flex flex-col items-center justify-center">
            <MultiImageUpload driveAddress={ASSET_SHDW_DRIVE_ADDRESS}>
              Add Collection Images
            </MultiImageUpload>
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}

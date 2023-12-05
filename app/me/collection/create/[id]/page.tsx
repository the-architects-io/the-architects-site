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
import { Collection, Creator, UploadJsonResponse } from "@/app/blueprint/types";
import { useUserData } from "@nhost/nextjs";
import { isUuid } from "uuidv4";
import { FieldArray, FormikProvider, useFormik } from "formik";
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
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { PlusIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { isValidPublicKey } from "@/utils/rpc";
import axios from "axios";

export default function CreateCollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const user = useUserData();
  const wallet = useWallet();
  const router = useRouter();
  const [collectionId, setCollectionId] = useState<string | null>(params?.id);
  const [
    collectionMetadatasJsonUploadResponse,
    setCollectionMetadatasJsonUploadResponse,
  ] = useState<UploadJsonResponse | null>(null);
  const [collectionMetadataStats, setCollectionMetadataStats] =
    useState<CollectionStatsFromCollectionMetadatas | null>(null);
  const [collectionImage, setCollectionImage] = useState<File | null>(null);
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [jsonBeingUploaded, setJsonBeingUploaded] = useState<any | null>(null);

  const formik = useFormik({
    initialValues: {
      collectionName: "",
      symbol: "",
      description: "",
      sellerFeeBasisPoints: 0,
      iamge: "",
      creators: [{ address: "", share: 0, sortOrder: 0, id: 0 }] as Creator[],
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
            return { ...creator, sortOrder: hoverIndex };
          }
          if (index === hoverIndex) {
            return { ...creator, sortOrder: dragIndex };
          }
          return creator;
        })
      );
    },
    [formik]
  );

  const handleAddCreator = useCallback(() => {
    formik.setFieldValue("creators", [
      ...formik.values.creators,
      {
        address: "",
        share: 0,
        sortOrder: formik.values.creators.length,
        id: formik.values.creators.length,
      },
    ]);
  }, [formik]);

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

  useEffect(() => {
    if (!params?.id || !isUuid(params?.id)) {
      router.push("/me/collection");
      return;
    }

    if (creators?.length && formik.values.creators.length === 0) {
      formik.setFieldValue(
        "creators",
        creators.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
    }

    if (jsonBeingUploaded && !collectionMetadataStats) {
      const collectionMetadataStats =
        getCollectionStatsFromCollectionMetadatas(jsonBeingUploaded);

      setCollectionMetadataStats(collectionMetadataStats);
    }
  }, [
    collectionMetadataStats,
    jsonBeingUploaded,
    params?.id,
    collectionMetadatasJsonUploadResponse,
    creators,
    formik.values.creators.length,
    formik,
    handleMetadataJsonUploadComplete,
    router,
  ]);

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
          <SingleImageUpload
            fileName={`${collectionId}-collection.png}`}
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
            setImage={setCollectionImage}
          >
            Add Collection Image
          </SingleImageUpload>
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
                <FormikProvider value={formik}>
                  <FieldArray
                    name="creators"
                    render={(arrayHelpers) => (
                      <div className="bg-black w-full">
                        {formik.values.creators
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((creator, index) => (
                            <DndCard
                              className="mb-4"
                              key={creator.id}
                              id={creator.id}
                              index={index}
                              moveCard={moveCard}
                            >
                              <div className="relative w-full flex">
                                <div className="flex flex-1 mr-4">
                                  <FormInputWithLabel
                                    label="Creator Address"
                                    name={`creators.${index}.address`}
                                    placeholder="Creator Address"
                                    onChange={formik.handleChange}
                                    value={creator.address}
                                  />
                                  {isValidPublicKey(creator.address) ? (
                                    <CheckBadgeIcon className="h-6 w-6 text-green-500 self-end ml-2 mb-1.5" />
                                  ) : (
                                    <XCircleIcon className="h-6 w-6 text-red-500 self-end ml-2 mb-1.5" />
                                  )}
                                </div>
                                <div className="w-24 mr-8">
                                  <FormInputWithLabel
                                    label="Share (in %)"
                                    name={`creators.${index}.share`}
                                    placeholder="Share"
                                    type="number"
                                    min={0}
                                    max={100}
                                    onChange={formik.handleChange}
                                    value={creator.share}
                                  />
                                </div>
                                {formik.values.creators.length > 1 && (
                                  <button
                                    className=" absolute -top-2 -right-2.5 cursor-pointer"
                                    type="button"
                                    onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                                  >
                                    <XMarkIcon className="h-6 w-6 text-gray-100" />
                                  </button>
                                )}
                              </div>
                            </DndCard>
                          ))}
                      </div>
                    )}
                  />
                </FormikProvider>
              </DndProvider>
              <PrimaryButton
                className="text-gray-100 mt-4"
                onClick={handleAddCreator}
                disabled={
                  !(
                    formik.values.creators.every(
                      (c) => !!c.address && isValidPublicKey(c.address)
                    ) && formik.values.creators.every((c) => c.share)
                  )
                }
              >
                <PlusIcon className="h-6 w-6" />
              </PrimaryButton>
            </>
          </div>
          <div className="border border-gray-600 rounded-lg px-4 w-full min-h-[28vh] mb-4 flex flex-col items-center justify-center">
            {!!collectionMetadataStats ? (
              <div className="flex flex-col items-center">
                <p className="text-gray-100 text-lg mb-4">
                  {collectionMetadataStats.count} NFTs
                </p>
                <p className="text-gray-100 text-lg mb-4 text-center">
                  <div>
                    {collectionMetadataStats.uniqueTraits.length} unique traits
                    across collection
                  </div>
                </p>
                <p className="text-gray-100 text-lg mb-4">
                  {collectionMetadataStats.creators.length}{" "}
                  {collectionMetadataStats.creators.length > 1
                    ? "creators"
                    : "creator"}
                </p>
              </div>
            ) : (
              <JsonUpload
                setJsonBeingUploaded={setJsonBeingUploaded}
                setJsonUploadResponse={handleMetadataJsonUploadComplete}
                driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
                fileName={`${collectionId}-collection-metadatas.json`}
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

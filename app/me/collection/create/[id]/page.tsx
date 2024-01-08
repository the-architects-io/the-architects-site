"use client";

import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import {
  creatorsAreValid,
  getCollectionStatsFromCollectionMetadatas,
} from "@/app/blueprint/utils";
import { useQuery } from "@apollo/client";
import { GET_COLLECTION_BY_ID } from "@/graphql/queries/get-collection-by-id";
import {
  Collection,
  CollectionStatsFromCollectionMetadatas,
  Creator,
  UploadJsonResponse,
} from "@/app/blueprint/types";
import { useUserData } from "@nhost/nextjs";
import { isUuid } from "uuidv4";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { createBlueprintClient } from "@/app/blueprint/client";
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
import { getRpcEndpoint, isValidPublicKey } from "@/utils/rpc";
import axios from "axios";
import classNames from "classnames";
import { CreateCollectionFormChecklist } from "@/features/collection/create-collection-form-checklist";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { SingleImageUploadResponse } from "@/features/upload/single-image/single-image-upload-field-wrapper";
import { useCluster } from "@/hooks/cluster";

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
  const [collectionImage, setCollectionImage] =
    useState<SingleImageUploadResponse | null>(null);
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [jsonBeingUploaded, setJsonBeingUploaded] = useState<any | null>(null);
  const { cluster } = useCluster();
  const [isSavingCollection, setIsSavingCollection] = useState(false);

  const formik = useFormik({
    initialValues: {
      collectionName: "",
      symbol: "",
      description: "",
      sellerFeeBasisPoints: 0,
      iamge: "",
    },
    onSubmit: async ({
      collectionName,
      symbol,
      description,
      sellerFeeBasisPoints,
    }) => {
      if (
        !wallet?.publicKey ||
        !collectionImage ||
        !collectionId ||
        !creators
      ) {
        showToast({
          primaryMessage: "Collection Upload Failed",
        });
        return;
      }

      setIsSavingCollection(true);

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { success } = await blueprint.collections.updateCollection({
        imageUrl: collectionImage.url,
        id: collectionId,
        name: collectionName,
        symbol,
        description,
        sellerFeeBasisPoints: sellerFeeBasisPoints * 100,
        creators,
        isReadyToMint: false,
      });

      if (!success) {
        showToast({
          primaryMessage: "There was a problem",
        });
        setIsSavingCollection(false);
        return;
      }

      router.push(`/me/collection/create/${collectionId}/set-creators`);
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
    formik,
    handleMetadataJsonUploadComplete,
    router,
    collectionId,
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
      <div className="w-full flex mb-24">
        <div className="flex flex-col items-center mb-16 w-full md:w-[500px]">
          <SingleImageUpload
            fileName={`${collectionId}-collection.png`}
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
            setImage={setCollectionImage}
          >
            Add Collection Image
          </SingleImageUpload>
          <CreateCollectionFormChecklist
            collectionImage={collectionImage}
            collectionName={formik.values.collectionName}
            symbol={formik.values.symbol}
            description={formik.values.description}
            sellerFeeBasisPoints={formik.values.sellerFeeBasisPoints}
          />
        </div>
        <div className="flex flex-col items-center w-full px-8">
          <div className="flex flex-col justify-center items-center w-full mb-8 space-y-4">
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
              onChange={(e) => {
                formik.handleChange(e);
                if (Number(e.target.value) > 100) {
                  formik.setFieldValue("sellerFeeBasisPoints", 100);
                }
              }}
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
      </div>
      <div className="flex bottom-0 left-0 right-0 fixed w-full justify-center items-center">
        <div className="bg-gray-900 w-full p-8 py-4">
          <SubmitButton
            isSubmitting={isSavingCollection}
            className="w-full"
            disabled={
              !(
                !!formik.values.collectionName &&
                !!formik.values.symbol &&
                !!formik.values.description &&
                !!formik.values.sellerFeeBasisPoints &&
                !!collectionImage
              )
            }
            onClick={formik.handleSubmit}
          >
            Next - Add Creators
          </SubmitButton>
        </div>
      </div>
    </ContentWrapper>
  );
}

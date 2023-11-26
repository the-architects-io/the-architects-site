import { UploadAssetsToShadowDriveResponse } from "@/app/api/upload-file-to-shadow-drive/route";
import { createBlueprintClient } from "@/app/blueprint/client";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  ASSET_SHDW_DRIVE_URL,
  BASE_URL,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { getSlug } from "@/utils/formatting";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";

export default function CreateCollectionNftForm({
  step,
  setStep,
  setSellerFeeBasisPoints,
  setCollectionNftAddress,
  airdropId,
}: {
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  step?: number;
  setStep?: (step: number) => void;
  setSellerFeeBasisPoints: (fee: number) => void;
  setCollectionNftAddress: (address: string) => void;
  airdropId?: string;
}) {
  const wallet = useWallet();
  const [files, setFiles] = useState<FileList | File[] | null>(null);
  const [collectionImageUrl, setCollectionImageUrl] = useState<string | null>(
    null
  );

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
      if (!wallet?.publicKey) return;

      if (!files?.length) return;

      const driveUrl = ASSET_SHDW_DRIVE_URL;

      const collectionNameSlug = getSlug(collectionName);

      const blueprint = createBlueprintClient({
        cluster: "devnet",
      });

      const { url } = await blueprint.uploadFile({
        file: files[0],
        fileName: `${collectionNameSlug}-collection.png`,
        driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
      });

      console.log({ url });

      setCollectionImageUrl(url);

      const basisPoints = sellerFeeBasisPoints * 100;

      let uri = "";

      const json = {
        name: collectionName,
        symbol,
        description,
        seller_fee_basis_points: basisPoints,
        image: `${driveUrl}/${collectionNameSlug}-collection.png`,
      };

      try {
        const { url } = await blueprint.uploadJson({
          json,
          fileName: `${collectionName.split(" ").join("-")}-collection.json`,
          driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
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
        setCollectionNftAddress(mintAddress);
        setSellerFeeBasisPoints(basisPoints);
        if (step && setStep) {
          setStep?.(step + 1);
        }
      } catch (error) {
        console.log({ error });
      }
    },
  });

  return (
    <div className="flex flex-col justify-center items-center w-full mb-4 space-y-4">
      {airdropId}
      <FormWrapper>
        <div className="flex flex-col justify-center w-full mb-4 space-y-4">
          <label className="mb-2">Collection Image</label>
          <input
            type="file"
            className="pb-4"
            onChange={(e) => {
              e.preventDefault();
              setFiles(!!e.target.files ? e.target.files : null);
            }}
          />
        </div>
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
        <div className="flex w-full justify-center pt-4">
          <SubmitButton
            onClick={formik.handleSubmit}
            isSubmitting={formik.isSubmitting}
          >
            Mint Collection NFT
          </SubmitButton>
        </div>
      </FormWrapper>
    </div>
  );
}

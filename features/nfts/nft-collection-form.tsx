import { UploadAssetsToShadowDriveResponse } from "@/app/api/upload-image-to-shadow-drive/route";
import { ASSET_SHDW_DRIVE_URL, BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { getSlug } from "@/utils/formatting";
import { Umi } from "@metaplex-foundation/umi";
import { ShdwDrive } from "@shadow-drive/sdk";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useFormik } from "formik";
import Image from "next/image";
import { useState } from "react";

export default function NftCollectionForm({
  umi,
  drive,
  isLoading,
  setIsLoading,
  step,
  setStep,
  setSellerFeeBasisPoints,
  setCollectionNftAddress,
}: {
  umi: Umi | null;
  drive: ShdwDrive | null;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  step?: number;
  setStep?: (step: number) => void;
  setSellerFeeBasisPoints: (fee: number) => void;
  setCollectionNftAddress: (address: string) => void;
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
      if (!umi || !wallet?.publicKey || !drive) return;

      if (!files?.length) return;

      const driveUrl = ASSET_SHDW_DRIVE_URL;

      const collectionNameSlug = getSlug(collectionName);

      const body = new FormData();
      body.set("image", files[0]);
      const fileName = `${collectionNameSlug}-collection.png`;
      body.set("fileName", fileName);

      const { data: uploadImageRes } =
        await axios.post<UploadAssetsToShadowDriveResponse>(
          `${BASE_URL}/api/upload-image-to-shadow-drive`,
          body,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

      const uploadUrl = uploadImageRes?.urls[0];
      console.log({ uploadUrl });

      setCollectionImageUrl(uploadUrl);

      // first build json file and upload to shdw
      const json = {
        name: collectionName,
        symbol,
        description,
        seller_fee_basis_points: sellerFeeBasisPoints * 100,
        image: `${driveUrl}/${collectionNameSlug}-collection.png`,
      };

      let uri = "";

      try {
        const { data: jsonUploadRes } =
          await axios.post<UploadAssetsToShadowDriveResponse>(
            `${BASE_URL}/api/upload-json-to-shadow-drive`,
            {
              json,
              fileName: `${collectionName
                .split(" ")
                .join("-")}-collection.json`,
            }
          );

        uri = jsonUploadRes?.urls[0];
      } catch (error) {
        console.log({ error });
      }

      try {
        console.log({ collectionName, uri, sellerFeeBasisPoints });

        const { data: mintRes } = await axios.post(`${BASE_URL}/api/mint-nft`, {
          name: collectionName,
          uri,
          sellerFeeBasisPoints,
          isCollection: true,
        });

        const { address } = mintRes;

        showToast({
          primaryMessage: "Collection NFT Minted",
          link: {
            title: "View NFT",
            url: `https://solscan.io/token/${address}`,
          },
        });
        setCollectionNftAddress(address);
        setSellerFeeBasisPoints(sellerFeeBasisPoints);
        if (step && setStep) {
          setStep?.(step + 1);
        }
      } catch (error) {
        console.log({ error });
      }
    },
  });

  if (!umi) return null;

  return (
    <div className="flex flex-col justify-center items-center w-full mb-4 space-y-4">
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

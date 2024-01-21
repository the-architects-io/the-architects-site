import { UploadAssetsToShadowDriveResponse } from "@/app/api/upload-file-to-shadow-drive/route";
import { createBlueprintClient } from "@/app/blueprint/client";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  BASE_URL,
  SHDW_DRIVE_BASE_URL,
} from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";
import { getSlug } from "@/utils/formatting";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFormik } from "formik";
import { useState } from "react";

export default function CreateCollectionNftForm({
  driveAddress,
  step,
  setStep,
  setSellerFeeBasisPoints,
  setCollectionNftAddress,
  airdropId,
}: {
  driveAddress: string;
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
  const { cluster } = useCluster();

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

      const driveUrl = `${SHDW_DRIVE_BASE_URL}/${driveAddress}}`;

      const collectionNameSlug = getSlug(collectionName);

      const blueprint = createBlueprintClient({
        cluster,
      });

      const { url } = await blueprint.upload.uploadFile({
        file: files[0],
        fileName: `${collectionNameSlug}-collection.png`,
        driveAddress,
      });

      setCollectionImageUrl(url);

      let uri = "";

      const jsonFile = new File(
        [JSON.stringify({ name: collectionName, symbol, description })],
        `${collectionNameSlug}-collection.json`,
        {
          type: "application/json",
        }
      );

      try {
        const { url } = await blueprint.upload.uploadJson({
          file: jsonFile,
          fileName: `${collectionName.split(" ").join("-")}-collection.json`,
          driveAddress,
        });

        uri = url;
      } catch (error) {
        handleError(error as Error);
      }

      try {
        console.log({ collectionName, uri, sellerFeeBasisPoints });

        const { success, mintAddress } = await blueprint.tokens.mintNft({
          name: collectionName,
          uri,
          sellerFeeBasisPoints,
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
        setSellerFeeBasisPoints(sellerFeeBasisPoints);
        if (step && setStep) {
          setStep?.(step + 1);
        }
      } catch (error) {
        handleError(error as Error);
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

import { createBlueprintClient } from "@/app/blueprint/client";
import { SHDW_DRIVE_BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import showToast from "@/features/toasts/show-toast";
import { getSlug } from "@/utils/formatting";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFormik } from "formik";
import { useState } from "react";

export default function CreateCollectionForm({
  driveAddress,
  setSellerFeeBasisPoints,
  setCollectionNftAddress,
}: {
  driveAddress: string;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  step?: number;
  setStep?: (step: number) => void;
  setSellerFeeBasisPoints: (fee: number) => void;
  setCollectionNftAddress: (address: string) => void;
}) {
  const wallet = useWallet();
  const [image, setImage] = useState<File | null>(null);
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
      if (!image) return;

      const driveUrl = `${SHDW_DRIVE_BASE_URL}/${driveAddress}}`;

      const collectionNameSlug = getSlug(collectionName);

      const blueprint = createBlueprintClient({
        cluster: "devnet",
      });

      const { url } = await blueprint.upload.uploadFile({
        file: image,
        fileName: `${collectionNameSlug}-collection.png`,
        driveAddress,
      });

      setCollectionImageUrl(url);
      const basisPoints = sellerFeeBasisPoints * 100;

      let uri = "";

      const jsonFile = new File(
        [JSON.stringify({ name: collectionName, symbol, description })],
        `${collectionName.split(" ").join("-")}-collection.json`,
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
        console.log({ error });
      }

      try {
        console.log({ collectionName, uri, sellerFeeBasisPoints });

        const { success, mintAddress } = await blueprint.tokens.mintNft({
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
      } catch (error) {
        console.log({ error });
      }
    },
  });

  return (
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
      <div className="flex w-full justify-center pt-4">
        <SubmitButton
          onClick={formik.handleSubmit}
          isSubmitting={formik.isSubmitting}
          disabled={
            !formik.values.collectionName ||
            !formik.values.symbol ||
            !formik.values.sellerFeeBasisPoints ||
            !image
          }
        >
          Create Collection
        </SubmitButton>
      </div>
    </div>
  );
}

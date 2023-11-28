"use client";
import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import CreateCollectionForm from "@/features/nft-collections/create-collection-form";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JsonUpload } from "@/features/upload/json/json-upload";
import { SingleImageUpload } from "@/features/upload/single-image/single-image-upload";
import { MultiImageUpload } from "@/features/upload/multi-image/multi-image-upload";

export default function CreateCollectionPage() {
  const wallet = useWallet();
  const router = useRouter();
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
          <JsonUpload
            driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
            fileName="test-collection-metas"
          >
            Add Collection Metadata JSONs
          </JsonUpload>
          <MultiImageUpload driveAddress={ASSET_SHDW_DRIVE_ADDRESS}>
            Add Collection Images
          </MultiImageUpload>
        </div>
      </div>
    </ContentWrapper>
  );
}

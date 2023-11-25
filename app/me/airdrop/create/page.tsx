"use client";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import AddAirdropMetadatasForm from "@/features/airdrop/add-airdrop-metadatas-form";
import AddAirdropRecipientsForm from "@/features/airdrop/add-airdrop-recipients-form";
import AddImagesForm from "@/features/airdrop/add-images-form";
import CreateAirdropForm from "@/features/airdrop/create-airdrop-form";
import CreateCollectionNftForm from "@/features/nfts/create-collection-nft-form";
import { Umi } from "@metaplex-foundation/umi/dist/types/Umi";
import { ShdwDrive } from "@shadow-drive/sdk";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AirdropCreatePage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [airdropId, setAirdropId] = useState<string | null>(
    "18928e38-a519-4123-96d7-a617f4d781eb"
  );
  const [drive, setDrive] = useState<ShdwDrive | null>(null);
  const [sellerFeeBasisPoints, setSellerFeeBasisPoints] = useState<
    number | null
  >(null);
  const [collectionNftAddress, setCollectionNftAddress] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (step === 2) {
      router.push(`/me/airdrop/${airdropId}`);
    }
  }, [step, airdropId, router]);

  if (!publicKey) {
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
      <Panel className="flex flex-col items-center mb-16">
        {step === 0 && (
          <CreateAirdropForm setAirdropId={setAirdropId} setStep={setStep} />
        )}
        {step === 1 && airdropId && (
          <CreateCollectionNftForm
            step={step}
            setStep={setStep}
            airdropId={airdropId}
            drive={drive}
            setSellerFeeBasisPoints={setSellerFeeBasisPoints}
            setCollectionNftAddress={setCollectionNftAddress}
          />
        )}
        {step === 2 && airdropId && (
          <AddAirdropMetadatasForm
            step={step}
            setStep={setStep}
            airdropId={airdropId}
          />
        )}
        {step === 3 && airdropId && (
          <AddImagesForm step={step} setStep={setStep} airdropId={airdropId} />
        )}
        {step === 4 && airdropId && (
          <AddAirdropRecipientsForm
            step={step}
            setStep={setStep}
            airdropId={airdropId}
          />
        )}
      </Panel>
    </ContentWrapper>
  );
}

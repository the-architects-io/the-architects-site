"use client";
import { ASSET_SHDW_DRIVE_ADDRESS } from "@/constants/constants";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import AddAirdropRecipientsForm from "@/features/airdrop/add-airdrop-recipients-form";
import CreateAirdropForm from "@/features/airdrop/create-airdrop-form";
import CreateCollectionForm from "@/features/nft-collections/create-collection-form";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AirdropCreatePage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [airdropId, setAirdropId] = useState<string | null>(null);
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
        <div>STEP {step + 1} OF 3</div>
        {step === 0 && (
          <>
            <CreateCollectionForm
              step={step}
              setStep={setStep}
              driveAddress={ASSET_SHDW_DRIVE_ADDRESS}
              setSellerFeeBasisPoints={setSellerFeeBasisPoints}
              setCollectionNftAddress={setCollectionNftAddress}
            />
          </>
        )}
        {step === 1 && airdropId && (
          <>
            <CreateAirdropForm setAirdropId={setAirdropId} setStep={setStep} />
          </>
        )}
        {step === 2 && airdropId && (
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

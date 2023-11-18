"use client";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import AddAirdropRecipientsForm from "@/features/airdrop/add-airdrop-recipients-form";
import CreateAirdropForm from "@/features/airdrop/create-airdrop-form";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AirdropCreatePage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [airdropId, setAirdropId] = useState<string | null>(null);

  useEffect(() => {
    if (step === 2) {
      router.push(`/airdrop/${airdropId}`);
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

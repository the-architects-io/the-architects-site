"use client";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { AddDispenserForm } from "@/features/dispensers/add-dispenser-form";
import { DispenserPayoutStructureForm } from "@/features/dispensers/dispenser-payout-structure-form";
import { DispenserRewardForm } from "@/features/dispensers/dispenser-reward-form";
import { DispenserSettingsForm } from "@/features/dispensers/dispenser-settings-form";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateDispenserPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [dispenserId, setDispenserId] = useState<string | null>(null);
  const stepParam = searchParams.get("step");
  const dispenserIdParam = searchParams.get("dispenserId");
  const { publicKey } = useWallet();

  useEffect(() => {
    if (stepParam && parseInt(stepParam) > -1 && parseInt(stepParam) < 3) {
      setStep(parseInt(stepParam));
    }
    if (dispenserIdParam) {
      setDispenserId(dispenserIdParam);
    }
  }, [dispenserIdParam, stepParam]);

  // if (!dispenserId) {
  //   return (
  //     <ContentWrapper>
  //       <Panel className="flex flex-col items-center mb-16">
  //         <h1 className="text-3xl my-4 text-gray-100">Create Dispenser</h1>
  //         <div className="my-16">
  //           <Spinner />
  //         </div>
  //       </Panel>
  //     </ContentWrapper>
  //   );
  // }

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
          <AddDispenserForm setDispenserId={setDispenserId} setStep={setStep} />
        )}
        {/* {step === 1 && dispenserId && (
          <DispenserCostForm dispenserId={dispenserId} setStep={setStep} />
        )} */}
        {step === 1 && dispenserId && (
          <>
            <DispenserRewardForm dispenserId={dispenserId} setStep={setStep} />
          </>
        )}
        {step === 2 && dispenserId && (
          <DispenserPayoutStructureForm
            dispenserId={dispenserId}
            setStep={setStep}
          />
        )}
        {step === 3 && dispenserId && (
          <DispenserSettingsForm dispenserId={dispenserId} setStep={setStep} />
        )}
      </Panel>
    </ContentWrapper>
  );
}

"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { AddDispenserForm } from "@/features/dispensers/add-dispenser-form";
import { DispenserPayoutStructureForm } from "@/features/dispensers/dispenser-payout-structure-form";
import { DispenserRewardForm } from "@/features/dispensers/dispenser-reward-form";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [step, setStep] = useState(1);
  const [dispenserId, setDispenserId] = useState<string | null>(
    "6ec102a3-cb10-4bae-b31e-3b22dd213b21"
  );

  const [heading, setHeading] = useState<string>("Create Dispenser");

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
      </Panel>
    </ContentWrapper>
  );
}

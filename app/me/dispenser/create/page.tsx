"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { AddDispenserForm } from "@/features/dispensers/add-dispenser-form";
import { DispenserCostForm } from "@/features/dispensers/dispenser-cost-form";
import { DispenserRewardForm } from "@/features/dispensers/dispenser-reward-form";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [step, setStep] = useState(0);
  const [dispenserId, setDispenserId] = useState<string | null>(null);

  const [heading, setHeading] = useState<string>("Create Dispenser");

  useEffect(() => {
    switch (step) {
      case 0:
        setHeading("Create Dispenser");
        break;
      case 1:
        setHeading("Add Costs");
        break;
      case 2:
        setHeading("Add Rewards");
        break;
    }
  }, [step]);

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center mb-16">
        <h1 className="text-3xl my-4 text-gray-100">{heading}</h1>
        {step === 0 && (
          <AddDispenserForm setDispenserId={setDispenserId} setStep={setStep} />
        )}
        {step === 1 && dispenserId && (
          <DispenserCostForm dispenserId={dispenserId} setStep={setStep} />
        )}
        {step === 2 && dispenserId && (
          <DispenserRewardForm dispenserId={dispenserId} setStep={setStep} />
        )}
      </Panel>
    </ContentWrapper>
  );
}

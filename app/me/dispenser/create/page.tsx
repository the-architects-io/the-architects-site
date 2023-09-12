"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { AddDispenserForm } from "@/features/dispensers/add-dispenser-form";
import { DispenserCostForm } from "@/features/dispensers/dispenser-cost-form";
import { useState } from "react";

export default function DashboardPage() {
  const [step, setStep] = useState(1);
  // const [dispenserId, setDispenserId] = useState<string | null>(null);
  const [dispenserId, setDispenserId] = useState<string | null>(
    "d46426df-c095-4787-ac8a-14700b0bfde0"
  );

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center mb-16">
        <h1 className="text-3xl my-4 text-gray-100">Create Dispenser</h1>
        {step === 0 && (
          <AddDispenserForm setDispenserId={setDispenserId} setStep={setStep} />
        )}
        {step === 1 && dispenserId && (
          <DispenserCostForm dispenserId={dispenserId} setStep={setStep} />
        )}
      </Panel>
    </ContentWrapper>
  );
}

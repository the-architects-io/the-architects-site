"use client";
import { AddDispenserForm } from "@/features/dispensers/add-dispenser-form";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { useState } from "react";

export default function CreateDispenserPage() {
  const { isAdmin } = useAdmin();
  const [step, setStep] = useState(0);
  const [dispenserId, setDispenserId] = useState<string | null>(null);

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      <div className="flex w-full mb-8 px-4">
        <BackButton />
      </div>
      <div className="text-center text-3xl mb-8 text-gray-100">
        Add Dispenser
      </div>
      <AddDispenserForm setDispenserId={setDispenserId} setStep={setStep} />
    </ContentWrapper>
  );
}

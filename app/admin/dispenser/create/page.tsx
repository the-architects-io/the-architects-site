"use client";
import { AddDispenserForm } from "@/features/admin/dispensers/add-dispenser-form";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";

export default function CreateDispenserPage() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      <div className="flex w-full mb-8 px-4">
        <BackButton />
      </div>
      <div className="text-center text-3xl mb-8 text-gray-300">
        Add Dispenser
      </div>
      <AddDispenserForm />
    </ContentWrapper>
  );
}

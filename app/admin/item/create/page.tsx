"use client";
import { AddItemForm } from "@/features/admin/items/add-item-form";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";

export default function CreateItemPage() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper>
      <div className="flex w-full mb-8 px-4">
        <BackButton />
      </div>
      <div className="text-center text-3xl mb-8 text-gray-300">Add Item</div>
      <AddItemForm />
    </ContentWrapper>
  );
}

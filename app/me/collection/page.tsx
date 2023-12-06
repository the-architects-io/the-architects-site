"use client";
import { Collection } from "@/app/blueprint/types";
import { CreateCollectionButton } from "@/app/blueprint/ui/create-collection-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import SharedHead from "@/features/UI/head";
import { Metadata } from "next";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function CollectionsPage() {
  const router = useRouter();

  const handleRedirect = (collection: Collection | null) => {
    if (!collection?.id) return;
    router.push(`/me/collection/create/${collection.id}`);
  };

  return (
    <>
      <ContentWrapper>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl pb-8">My Collections</h1>
          <CreateCollectionButton
            name="Test Collection"
            onSuccess={(collection) => handleRedirect(collection)}
          />
        </div>
      </ContentWrapper>
    </>
  );
}

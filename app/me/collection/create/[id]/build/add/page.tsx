"use client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { CreateCnftAdvanced } from "@/features/cnfts/create-cnft-advanced";
import showToast from "@/features/toasts/show-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BuildCollectionPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const router = useRouter();

  const handleRedirect = () => {
    showToast({
      primaryMessage: "cNFT Saved",
    });
    router.push(`/me/collection/create/${params.id}/build`);
  };

  return (
    <ContentWrapper className="flex flex-col md:flex-row items-center justify-center text-stone-300">
      <CreateCnftAdvanced
        onCompleted={handleRedirect}
        collectionId={params.id}
      />
    </ContentWrapper>
  );
}

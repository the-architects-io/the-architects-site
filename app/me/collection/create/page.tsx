"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateCollectionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/me/collection");
  }, [router]);

  return (
    <ContentWrapper>
      <div className="flex flex-col items-center pt-8">
        <Spinner />
      </div>
    </ContentWrapper>
  );
}

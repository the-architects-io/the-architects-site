"use client";
import useBlueprint from "@/app/blueprint/hooks/use-blueprint";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";

export default function Page() {
  const { ws } = useBlueprint();

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <PrimaryButton className="mb-4" onClick={() => ws.PING()}>
        Ping
      </PrimaryButton>
    </ContentWrapper>
  );
}

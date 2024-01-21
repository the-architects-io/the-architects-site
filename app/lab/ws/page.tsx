"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import useBlueprint from "@/app/blueprint/hooks/use-blueprint";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";

export default function Page() {
  const { ws } = useBlueprint();
  const { cluster } = useCluster();

  const handleCreateException = () => {
    handleError(new Error("Error thrown from frontend exception!"), {
      message: "This is a test exception",
      stack: "This is a test exception",
    });
  };

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <PrimaryButton className="mb-4" onClick={() => ws.PING()}>
        PING
      </PrimaryButton>
      <PrimaryButton className="mb-4" onClick={handleCreateException}>
        CREATE EXCEPTION
      </PrimaryButton>
    </ContentWrapper>
  );
}

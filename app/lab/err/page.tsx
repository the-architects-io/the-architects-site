"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import useBlueprint from "@/app/blueprint/hooks/use-blueprint";
import { ARCHITECTS_API_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";
import axios, { AxiosError } from "axios";

export default function Page() {
  const { ws } = useBlueprint();
  const { cluster } = useCluster();

  const handleCreateException = async () => {
    try {
      const res = await axios.get(
        `https://google.com/exception/this-is-not-a-real-url`
      );
    } catch (err) {
      console.log("err", err);
      debugger;
      handleError(err as AxiosError, {
        message: "This is a test from axios request exception!",
      });
    }
  };

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <PrimaryButton className="mb-4" onClick={handleCreateException}>
        CREATE EXCEPTION
      </PrimaryButton>
    </ContentWrapper>
  );
}

"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { TokenMintingForm } from "@/features/dispensers/token-minting-form";

export default function Page() {
  return (
    <ContentWrapper>
      <Panel>
        <h1>Minting Lab</h1>
        <TokenMintingForm />
      </Panel>
    </ContentWrapper>
  );
}

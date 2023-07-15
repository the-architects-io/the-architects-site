"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { useWallet } from "@solana/wallet-adapter-react";
import ClaimButton from "@/app/blueprint/components/dispensers/claim-button";

export default function LootBoxPage({ params }: { params: any }) {
  const { publicKey } = useWallet();

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <ClaimButton dispenserId={params.id} />
      </Panel>
    </ContentWrapper>
  );
}

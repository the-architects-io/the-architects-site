"use client";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import CreateAirdropForm from "@/features/airdrop/create-airdrop-form";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AirdropCreatePage({
  params,
}: {
  params: { id: string };
}) {
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!params?.id) {
      router.push("/me/airdrop");
    }
  }, [params?.id, router]);

  if (!publicKey) {
    return (
      <ContentWrapper>
        <div className="flex flex-col items-center pt-8">
          <p className="text-gray-100 text-lg mb-8">
            Please connect your wallet to continue.
          </p>
          <WalletButton />
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center mb-16">
        {!!params?.id && <CreateAirdropForm airdropId={params.id} />}
      </Panel>
    </ContentWrapper>
  );
}

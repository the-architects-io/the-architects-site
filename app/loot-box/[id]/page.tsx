"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import useCostBalance from "@/app/blueprint/hooks/use-cost-balance";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";

export default function LootBoxPage({ params }: { params: any }) {
  const { publicKey } = useWallet();
  const { name, cost, id, imageUrl } = useDispenser(params.id);
  const { balance, isLoading } = useCostBalance(cost, publicKey);

  if (!id)
    return (
      <ContentWrapper>
        <Panel className="flex flex-col justify-center items-center">
          <h1>Not found</h1>
        </Panel>
      </ContentWrapper>
    );

  return (
    <ContentWrapper>
      <Panel className="flex flex-col items-center">
        <h1>{name}</h1>
        <Image
          src={`${imageUrl}`}
          alt={`${name} image`}
          width={200}
          height={200}
        />
        <>{isLoading ? <Spinner /> : <>balance: {balance}</>}</>
      </Panel>
    </ContentWrapper>
  );
}

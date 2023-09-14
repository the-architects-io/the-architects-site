"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import useCostBalance from "@/app/blueprint/hooks/use-cost-balance";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import useRewards from "@/app/blueprint/hooks/use-rewards";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import showToast from "@/features/toasts/show-toast";

export default function LootBoxPage({ params }: { params: any }) {
  const { publicKey } = useWallet();
  const { name, costs, id, imageUrl, rewards, claimReward, isClaiming } =
    useDispenser(params.id);
  const { balance, isLoading } = useCostBalance(costs, publicKey);
  const { rewardsWithBalances, isLoading: isLoadingBalances } =
    useRewards(rewards);

  const handleClaim = async () => {
    if (!publicKey) return;
    const { txAddress, payout } = await claimReward(publicKey.toString());
    showToast({
      primaryMessage: "Claimed!",
      secondaryMessage: `You received ${payout?.amount} tokens`,
    });
  };

  if (!id)
    return (
      <ContentWrapper>
        <Panel className="flex flex-col justify-center items-center">
          {isLoading ? <Spinner /> : "No dispenser found"}
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
        <>
          {isLoading ? (
            <Spinner />
          ) : (
            <>your balance: {JSON.stringify(balance)}</>
          )}
        </>
        <>
          {isLoadingBalances ? (
            <Spinner />
          ) : (
            <>
              {rewardsWithBalances?.map(({ name, balance }) => (
                <div key={name}>
                  {name}: {balance}
                </div>
              ))}
            </>
          )}
        </>
        <PrimaryButton onClick={isClaiming ? () => {} : handleClaim}>
          {isClaiming ? <Spinner /> : "Claim"}
        </PrimaryButton>
      </Panel>
    </ContentWrapper>
  );
}

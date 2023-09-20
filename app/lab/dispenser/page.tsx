"use client";
import * as anchor from "@coral-xyz/anchor";
import { DISPENSER_PROGRAM_ID } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { useSearchParams } from "next/navigation";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import axios from "axios";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { RewardsList } from "@/features/rewards/rewards-list";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { getAmountWithoutDecimals } from "@/utils/currency";

export default function Page({ params }: { params: any }) {
  const user = useUserData();
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const searchParams = useSearchParams();
  const { publicKey } = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);

  const { dispenser, isLoading, fetchRewardTokenBalances } = useDispenser(
    searchParams.get("id") || ""
  );

  const handleClaim = async () => {
    if (!DISPENSER_PROGRAM_ID || !dispenser?.id || !publicKey)
      throw new Error("Missing required data.");

    try {
      setIsClaiming(true);

      const amount = getAmountWithoutDecimals(
        dispenser.rewardCollections[0].itemCollection.amount,
        dispenser.rewardCollections[0].itemCollection.item.token.decimals
      );

      console.log({ amount });

      const { data } = await axios.post("/api/dispense-token", {
        dispenserId: dispenser.id,
        recipientAddress: publicKey,
        mintAddress:
          dispenser.rewardCollections[0].itemCollection.item.token.mintAddress,
        amount,
      });

      console.log({ data });
      const { txHash } = data;

      showToast({
        primaryMessage: "Sent!",
        secondaryMessage: "You have claimed your reward!",
        link: {
          url: `https://explorer.solana.com/tx/${txHash}?cluster=devnet`,
          title: "View on Solana Explorer",
        },
      });
      setIsClaiming(false);
      // refetch && refetch();
    } catch (error) {
      showToast({
        primaryMessage: "Error claiming token",
        secondaryMessage: "Please try again later.",
      });
    }
  };

  return (
    <ContentWrapper>
      {!dispenser && hasBeenFetched && <div>Dispenser not found</div>}
      {isLoading && <div>Loading...</div>}
      {!isLoading && dispenser && (
        <Panel className="flex flex-col items-center">
          <ImageWithFallback
            src={dispenser.imageUrl || ""}
            height={120}
            width={120}
            className="w-36 mb-8"
            alt={dispenser.name || "Dispenser image"}
          />
          <p className="text-center text-3xl mb-4">{dispenser.name} </p>
          <p className="text-center text-xl mb-4">{dispenser.description}</p>

          {!!dispenser?.id && (
            <RewardsList
              dispenserId={dispenser?.id}
              className="mb-4 max-w-md"
            />
          )}

          <WalletButton />
          <PrimaryButton
            className="my-4"
            onClick={handleClaim}
            disabled={!publicKey || isClaiming}
          >
            {isClaiming ? <Spinner /> : "Claim"}
          </PrimaryButton>
        </Panel>
      )}
    </ContentWrapper>
  );
}

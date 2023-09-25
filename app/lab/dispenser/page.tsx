"use client";
import * as anchor from "@coral-xyz/anchor";
import {
  BASE_URL,
  DISPENSER_PROGRAM_ID,
  RPC_ENDPOINT,
} from "@/constants/constants";
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
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAllDigitalAssetWithTokenByOwner } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { Dispenser, TokenBalance } from "@/app/blueprint/types";
import { toBaseUnit } from "@/utils/currency";

export default function Page({ params }: { params: any }) {
  const user = useUserData();
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const searchParams = useSearchParams();
  const { publicKey: pubKey } = useWallet();
  const [isClaiming, setIsClaiming] = useState(false);
  const [inStockMintAddresses, setInStockMintAddresses] = useState<string[]>(
    []
  );
  const [hasStock, setHasStock] = useState<boolean>(false);

  const { dispenser, isLoading, fetchRewardTokenBalances } = useDispenser(
    searchParams.get("id") || ""
  );

  enum PayoutMethod {
    RANDOM = "RANDOM",
    SORTED = "SORTED",
  }

  const handleClaim = async () => {
    if (!DISPENSER_PROGRAM_ID || !dispenser?.id || !pubKey)
      throw new Error("Missing required data.");

    try {
      setIsClaiming(true);

      const umi = createUmi(RPC_ENDPOINT);

      const onChainDispenserAssets = await fetchAllDigitalAssetWithTokenByOwner(
        umi,
        publicKey(dispenser.rewardWalletAddress)
      );

      const { data: tokenBalances }: { data: TokenBalance[] } =
        await axios.post(`${BASE_URL}/api/get-token-balances-from-helius`, {
          walletAddress: dispenser?.rewardWalletAddress,
        });

      let rewards = dispenser.rewardCollections.filter((reward) => {
        const { mintAddress } = reward.itemCollection.item.token;
        return (
          onChainDispenserAssets.find(
            (asset) => asset.publicKey === mintAddress
          ) || tokenBalances.find((token) => token.mint === mintAddress)
        );
      });

      setInStockMintAddresses(
        rewards.map((reward) => reward.itemCollection.item.token.mintAddress)
      );
      setHasStock(!!rewards.length);

      const payoutMethod: PayoutMethod =
        rewards[0]?.payoutSortOrder && rewards[0].payoutSortOrder > -1
          ? PayoutMethod.SORTED
          : PayoutMethod.RANDOM;

      let reward;

      if (payoutMethod === PayoutMethod.SORTED) {
        reward = rewards.sort(
          (a, b) => (a.payoutSortOrder || 0) - (b.payoutSortOrder || 0)
        )[0];
      }

      if (payoutMethod === PayoutMethod.RANDOM) {
        const random = Math.random();
        const totalPayoutChance = rewards.reduce(
          (prev, current) => prev + (current.payoutChance || 0),
          0
        );
        let cumulativePayoutChance = 0;
        reward = rewards.find((reward) => {
          cumulativePayoutChance +=
            (reward.payoutChance || 0) / totalPayoutChance;
          return random <= cumulativePayoutChance;
        });

        console.log({ random, totalPayoutChance, cumulativePayoutChance });
      }

      if (!reward) throw new Error("Dispenser is empty");

      // either get random reward or next sorted reward
      const amount = toBaseUnit(
        reward.itemCollection.amount,
        dispenser.rewardCollections[0].itemCollection.item.token.decimals
      );

      console.log({ reward, amount });

      const { data } = await axios.post("/api/dispense-token", {
        dispenserId: dispenser.id,
        recipientAddress: pubKey,
        mintAddress: reward.itemCollection.item.token.mintAddress,
        amount,
      });

      console.log({ data });
      const { txHash } = data;

      showToast({
        primaryMessage: "Sent!",
        secondaryMessage: "You have claimed your reward!",
        link: {
          url: `https://solscan.io/tx/${txHash}?cluster=devnet`,
          title: "View on Transaction",
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
              inStockMintAddresses={inStockMintAddresses}
              dispenserId={dispenser?.id}
              className="mb-4 max-w-md"
            />
          )}

          <WalletButton />
          {!hasStock && (
            <p className="text-center my-4">This dispenser is out of stock.</p>
          )}
          <PrimaryButton
            className="my-4"
            onClick={handleClaim}
            disabled={!pubKey || isClaiming || !hasStock}
          >
            {isClaiming ? <Spinner /> : "Claim"}
          </PrimaryButton>
        </Panel>
      )}
    </ContentWrapper>
  );
}

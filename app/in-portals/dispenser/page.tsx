"use client";
import {
  BASE_URL,
  DISPENSER_PROGRAM_ID,
  ENV,
  RPC_ENDPOINT,
} from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import axios from "axios";
import WalletButton from "@/features/UI/buttons/wallet-button";
import { RewardsList } from "@/features/rewards/rewards-list";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { getAmountWithoutDecimals } from "@/utils/currency";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAllDigitalAssetWithTokenByOwner } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { Dispenser, TokenBalance } from "@/app/blueprint/types";
import { PublicKey } from "@metaplex-foundation/js";
import PortalsSdk from "@/utils/portals-sdk-v2";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const [isClaiming, setIsClaiming] = useState(false);
  const [inStockMintAddresses, setInStockMintAddresses] = useState<string[]>(
    []
  );
  const [hasStock, setHasStock] = useState<boolean>(false);
  const [rewards, setRewards] = useState<Dispenser["rewardCollections"]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);

  const { dispenser, isLoading, fetchRewardTokenBalances } = useDispenser(
    searchParams.get("id") || ""
  );
  const [hasFetchedBalances, setHasFetchedBalances] = useState<boolean>(false);
  const [isFetchingBalances, setIsFetchingBalances] = useState<boolean>(false);
  const { publicKey: walletAdapterWalletAddress } = useWallet();
  const [inPortalsWalletAddress, setInPortalsWalletAddress] =
    useState<PublicKey | null>(null);
  const [showReloadButton, setShowReloadButton] = useState(false);

  enum PayoutMethod {
    RANDOM = "RANDOM",
    SORTED = "SORTED",
  }

  const updateBalances = useCallback(async () => {
    if (!dispenser?.rewardWalletAddress || isFetchingBalances) return;
    const umi = createUmi(RPC_ENDPOINT);

    const onChainDispenserAssets = await fetchAllDigitalAssetWithTokenByOwner(
      umi,
      publicKey(dispenser.rewardWalletAddress)
    );

    const { data: tokenBalances }: { data: TokenBalance[] } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: dispenser?.rewardWalletAddress,
      }
    );

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
    setRewards(rewards);
    console.log({ rewards });

    setHasFetchedBalances(true);
    setIsFetchingBalances(false);
  }, [dispenser, isFetchingBalances]);

  const handleClaim = useCallback(async () => {
    if (!DISPENSER_PROGRAM_ID || !dispenser?.id)
      throw new Error("Missing required data.");

    try {
      setIsClaiming(true);

      // await updateBalances();

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
      const amount = getAmountWithoutDecimals(
        reward.itemCollection.amount,
        dispenser.rewardCollections[0].itemCollection.item.token.decimals
      );

      console.log({ reward, amount });

      const { data } = await axios.post("/api/dispense-token", {
        dispenserId: dispenser.id,
        recipientAddress: inPortalsWalletAddress?.toString(),
        mintAddress: reward.itemCollection.item.token.mintAddress,
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
  }, [
    PayoutMethod.RANDOM,
    PayoutMethod.SORTED,
    dispenser,
    inPortalsWalletAddress,
    rewards,
  ]);

  useEffect(() => {
    if (!hasFetchedBalances) {
      updateBalances();
    }
  }, [
    dispenser.id,
    fetchRewardTokenBalances,
    hasFetchedBalances,
    updateBalances,
  ]);

  const requestPublicKey = () => {
    PortalsSdk.requestPublicKey("https://theportal.to", (publicKey: string) => {
      console.log("publicKey", publicKey);
      setInPortalsWalletAddress(new PublicKey(publicKey));
    });
  };

  const requestRoomId = () => {
    PortalsSdk.getRoomId(({ roomId }: { roomId: string }) => {
      console.log("roomId", roomId);
      setRoomId(roomId);
    });
  };

  useEffect(() => {
    if (!inPortalsWalletAddress && ENV !== "local") requestPublicKey();
    if (!roomId && ENV !== "local") requestRoomId();

    if (inPortalsWalletAddress || walletAdapterWalletAddress)
      setTimeout(() => {
        if (!inPortalsWalletAddress && ENV !== "local")
          setShowReloadButton(true);
      }, 15000);
  }, [inPortalsWalletAddress, roomId, walletAdapterWalletAddress]);

  if (!inPortalsWalletAddress && ENV !== "local")
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
        <Spinner />
      </div>
    );

  return (
    <div className="">
      {!walletAdapterWalletAddress && !inPortalsWalletAddress ? (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300 bg-slate-800">
          {ENV === "local" && (
            <div className="absolute top-4 right-4">
              <WalletButton />
            </div>
          )}
          <div className="max-w-xs text-center mb-4">
            Please allow your wallet to be connected in the popup above.
          </div>
          <Spinner />
          {showReloadButton && (
            <button
              className="bg-green-500 hover:bg-green-600 text-slate-800 rounded-xl px-16 py-3 border border-green-500 hover:border-green-500 transition-colors duration-300 ease-in-out text-xl font-semibold shadow-green-500 shadow-md mt-16"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div
          className="min-h-screen flex flex-col justify-center items-center py-16"
          style={{ backgroundColor: "darkgreen" }}
        >
          {ENV === "local" && (
            <div className="absolute top-4 right-4">
              <WalletButton />
            </div>
          )}
          {!dispenser && !isLoading && <div>Dispenser not found</div>}
          {isLoading && (
            <div className="flex flex-col justify-center items-center w-full">
              <Spinner />
            </div>
          )}
          {!isLoading && dispenser && (
            <div className="flex flex-col items-center">
              <ImageWithFallback
                src={dispenser.imageUrl || ""}
                height={120}
                width={120}
                className="w-36 mb-8"
                alt={dispenser.name || "Dispenser image"}
              />
              <p className="text-center text-4xl mb-4">{dispenser.name} </p>
              <p className="text-center text-xl mb-4">
                {dispenser.description}
              </p>

              {!!dispenser?.id && (
                <RewardsList
                  inStockMintAddresses={inStockMintAddresses}
                  dispenserId={dispenser?.id}
                  className="mb-4 max-w-md"
                />
              )}

              {!hasStock && hasFetchedBalances && !isFetchingBalances && (
                <p className="text-center my-4">
                  This dispenser is out of stock!
                </p>
              )}
              <PrimaryButton
                className="my-4"
                onClick={handleClaim}
                disabled={isClaiming || !hasStock}
              >
                {isClaiming ? <Spinner /> : "Claim"}
              </PrimaryButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

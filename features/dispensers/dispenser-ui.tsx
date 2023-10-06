import {
  BASE_URL,
  DISPENSER_PROGRAM_ID,
  ENV,
  RPC_ENDPOINT_DEVNET,
} from "@/constants/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { Dispatch, useCallback, useEffect, useState } from "react";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import axios from "axios";
import WalletButton from "@/features/UI/buttons/wallet-button";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { toBaseUnit } from "@/utils/currency";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAllDigitalAssetWithTokenByOwner } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import {
  BlueprintApiActions,
  Dispenser,
  RewardDisplayTypes,
  TokenBalance,
} from "@/app/blueprint/types";
import { PublicKey } from "@metaplex-foundation/js";
import PortalsSdk from "@/utils/portals-sdk-v2";
import { useSearchParams } from "next/navigation";
import classNames from "classnames";
import { RewardsUI } from "@/features/rewards/rewards-ui";
import { useQuery } from "@apollo/client";
import { GET_PAYOUTS } from "@/graphql/queries/get-payouts";
import { Payout } from "@/app/profile/[id]/page";

interface DispenserUiProps {
  dispenserId: string;
  backgroundColor?: string;
  textColor?: string;
  shouldDisplayRewards?: boolean;
  shouldDisplayName?: boolean;
  shouldDisplayDescription?: boolean;
  shouldDisplayImage?: boolean;
  claimButtonColor?: string;
  claimButtonTextColor?: string;
  imageSize?: number;
  nameTextSize?: number;
  descriptionTextSize?: number;
  claimButtonTextSize?: number;
  claimButtonText?: string;
  isBeingEdited?: boolean;
  rewardDisplayType?: RewardDisplayTypes;
  setDispensedInfo?: Dispatch<any>;
  children?: React.ReactNode;
}

export default function DispenserUi({
  dispenserId,
  backgroundColor,
  textColor,
  shouldDisplayRewards = true,
  shouldDisplayName = true,
  shouldDisplayDescription = true,
  shouldDisplayImage = true,
  claimButtonColor,
  claimButtonTextColor,
  imageSize,
  nameTextSize,
  descriptionTextSize,
  claimButtonTextSize,
  claimButtonText,
  isBeingEdited = false,
  rewardDisplayType,
  setDispensedInfo,
  children,
}: DispenserUiProps) {
  const searchParams = useSearchParams();
  const [isClaiming, setIsClaiming] = useState(false);
  const [inStockMintAddresses, setInStockMintAddresses] = useState<string[]>(
    []
  );
  const [hasStock, setHasStock] = useState<boolean>(false);
  const [rewards, setRewards] = useState<Dispenser["rewardCollections"]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [hasFetchedRoomId, setHasFetchedRoomId] = useState<boolean>(false);

  const { dispenser, isLoading, fetchRewardTokenBalances, refetch } =
    useDispenser(dispenserId);
  const [hasFetchedBalances, setHasFetchedBalances] = useState<boolean>(false);
  const [isFetchingBalances, setIsFetchingBalances] = useState<boolean>(false);
  const { publicKey: walletAdapterWalletAddress } = useWallet();
  const [inPortalsWalletAddress, setInPortalsWalletAddress] =
    useState<PublicKey | null>(null);
  const [
    hasFetchedInPortalsWalletAddress,
    setHasFetchedInPortalsWalletAddress,
  ] = useState<boolean>(false);
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [hasPassedCooldownCheck, setHasPassedCooldownCheck] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [lastClaimTimeString, setLastClaimTimeString] = useState<string>("");
  const [nextClaimTimeString, setNextClaimTimeString] = useState<string>("");
  const [hasCooldown, setHasCooldown] = useState<boolean>(false);

  const {
    loading: isFetchingPayouts,
    error: fetchPayoutsError,
    called: hasFechedPayouts,
  } = useQuery(GET_PAYOUTS, {
    variables: {
      dispenserId: dispenserId,
      walletAddress:
        inPortalsWalletAddress?.toString() ||
        walletAdapterWalletAddress?.toString(),
    },
    skip: !inPortalsWalletAddress && !walletAdapterWalletAddress,
    onCompleted: ({ payouts }: { payouts: Payout[] }) => {
      const sortedPayouts = [...payouts].sort(
        (a: Payout, b: Payout) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPayouts(sortedPayouts);
      !!refetch && refetch();
    },
  });

  enum PayoutMethod {
    RANDOM = "RANDOM",
    SORTED = "SORTED",
  }

  const updateBalances = useCallback(async () => {
    if (!dispenser?.rewardWalletAddress || isFetchingBalances) return;
    setIsFetchingBalances(true);
    const umi = createUmi(RPC_ENDPOINT_DEVNET);

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
    if (!DISPENSER_PROGRAM_ID || !dispenser?.id || !walletAddress)
      throw new Error("Missing required data.");

    try {
      setIsClaiming(true);

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

      const { data } = await axios.post("/api/blueprint", {
        action: BlueprintApiActions.DISPENSE_TOKENS,
        params: {
          dispenserId: dispenser.id,
          recipientAddress: walletAddress,
          mintAddress: reward.itemCollection.item.token.mintAddress,
          amount,
        },
      });

      console.log({ data });
      setDispensedInfo && setDispensedInfo(data);
    } catch (error) {
      showToast({
        primaryMessage: "Error claiming token",
        secondaryMessage: "Please try again later.",
      });
    } finally {
      setIsClaiming(false);
    }
  }, [
    PayoutMethod.RANDOM,
    PayoutMethod.SORTED,
    dispenser.id,
    dispenser.rewardCollections,
    rewards,
    setDispensedInfo,
    walletAddress,
  ]);

  useEffect(() => {
    if (!hasFetchedBalances && !isFetchingBalances && !rewards.length) {
      updateBalances();
    }
  }, [
    dispenser.id,
    fetchRewardTokenBalances,
    hasFetchedBalances,
    isFetchingBalances,
    rewards.length,
    updateBalances,
  ]);

  const requestPublicKey = () => {
    PortalsSdk.requestPublicKey("https://theportal.to", (publicKey: string) => {
      setHasFetchedInPortalsWalletAddress(true);
      console.log("publicKey", publicKey);
      setInPortalsWalletAddress(new PublicKey(publicKey));
    });
  };

  const requestRoomId = () => {
    PortalsSdk.getRoomId(({ roomId }: { roomId: string }) => {
      setHasFetchedRoomId(true);
      console.log("roomId", roomId);
      setRoomId(roomId);
    });
  };

  useEffect(() => {
    if (!dispenser?.id) return;

    if (ENV === "local" && !walletAddress && walletAdapterWalletAddress) {
      setWalletAddress(walletAdapterWalletAddress.toString());
    }

    if (inPortalsWalletAddress && !walletAddress) {
      setWalletAddress(inPortalsWalletAddress.toString());
    }

    if (
      !inPortalsWalletAddress &&
      !hasFetchedInPortalsWalletAddress &&
      ENV !== "local"
    )
      requestPublicKey();

    if (!roomId && !hasFetchedRoomId && ENV !== "local") requestRoomId();

    const cooldownInMs = dispenser?.cooldownInMs || 0;

    if (cooldownInMs) {
      setHasCooldown(!!cooldownInMs);
    } else {
      setHasCooldown(false);
      setHasPassedCooldownCheck(!lastClaimTimeString?.length);
    }

    if (cooldownInMs && payouts?.length) {
      // UTC timestamp of when the last claim was made
      const lastClaimedAt = payouts[0].createdAt;
      const now = new Date().getTime();
      const timeSinceLastClaim = now - new Date(lastClaimedAt).getTime();
      const hasPassedCooldownCheck = timeSinceLastClaim >= cooldownInMs;
      setHasPassedCooldownCheck(hasPassedCooldownCheck);
      // display as days, hours, minutes, seconds
      let lastClaimTime = `${Math.floor(
        timeSinceLastClaim / 86400000
      )}d ${Math.floor(
        (timeSinceLastClaim % 86400000) / 3600000
      )}h ${Math.floor(((timeSinceLastClaim % 86400000) % 3600000) / 60000)}m ${
        Math.floor(
          (((timeSinceLastClaim % 86400000) % 3600000) % 60000) / 1000
        ) || 0
      }s`;

      lastClaimTime = lastClaimTime.replace(/0d /, "");
      lastClaimTime = lastClaimTime.replace(/0h /, "");
      lastClaimTime = lastClaimTime.replace(/0m /, "");
      lastClaimTime = lastClaimTime.replace(/0s/, "");

      setLastClaimTimeString(lastClaimTime);
      let nextClaimTime = `${Math.floor(
        (cooldownInMs - timeSinceLastClaim) / 86400000
      )}d ${Math.floor(
        ((cooldownInMs - timeSinceLastClaim) % 86400000) / 3600000
      )}h ${Math.floor(
        (((cooldownInMs - timeSinceLastClaim) % 86400000) % 3600000) / 60000
      )}m ${
        Math.floor(
          ((((cooldownInMs - timeSinceLastClaim) % 86400000) % 3600000) %
            60000) /
            1000
        ) || 0
      }s`;

      nextClaimTime = nextClaimTime.replace(/0d /, "");
      nextClaimTime = nextClaimTime.replace(/0h /, "");
      nextClaimTime = nextClaimTime.replace(/0m /, "");
      nextClaimTime = nextClaimTime.replace(/0s/, "");

      setNextClaimTimeString(nextClaimTime);
    }

    if (hasFechedPayouts && !payouts?.length) {
      setHasPassedCooldownCheck(true);
    }

    if (!cooldownInMs && !payouts?.length && hasFechedPayouts) {
      setHasPassedCooldownCheck(false);
    }

    if (walletAddress) {
      setTimeout(() => setShowReloadButton(true), 15000);
    }
  }, [
    hasFetchedInPortalsWalletAddress,
    hasFetchedRoomId,
    inPortalsWalletAddress,
    roomId,
    walletAdapterWalletAddress,
    walletAddress,
    dispenser,
    payouts,
    hasFechedPayouts,
    isBeingEdited,
    lastClaimTimeString?.length,
  ]);

  if (
    !inPortalsWalletAddress &&
    ENV !== "local" &&
    walletAdapterWalletAddress?.toString() !==
      "44Cv2k5kFRzGQwBLEBc6aHHTwTvEReyeh4PHMH1cBgAe" &&
    !isBeingEdited
  )
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300">
        <Spinner />
      </div>
    );

  return (
    <>
      {ENV === "local" && (
        <div className="absolute bottom-4 left-4">
          <WalletButton />
        </div>
      )}
      {!walletAddress && !isBeingEdited ? (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-stone-300 bg-slate-800">
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
          className="min-h-screen w-full flex flex-col justify-center items-center py-16 overflow-y-hidden"
          style={{
            backgroundColor: backgroundColor || "transparent",
            color: textColor,
          }}
        >
          {/* {ENV === "local" && (
            <div className="absolute top-24 left-4">
              <WalletButton />
            </div>
          )} */}
          {!dispenser && !isLoading && <div>Dispenser not found</div>}
          {isLoading && (
            <div className="flex flex-col justify-center items-center w-full">
              <Spinner />
            </div>
          )}
          {!isLoading && dispenser?.id && (
            <div className="flex flex-col items-center w-full">
              {!!shouldDisplayImage && (
                <ImageWithFallback
                  src={dispenser.imageUrl || ""}
                  height={imageSize || 120}
                  width={imageSize || 120}
                  className="mb-8"
                  alt={dispenser.name || "Dispenser image"}
                />
              )}
              {!!shouldDisplayName && (
                <p
                  className="text-center mb-4"
                  style={{ fontSize: `${nameTextSize}px` || "36px" }}
                >
                  {dispenser.name}{" "}
                </p>
              )}
              {!!shouldDisplayDescription && (
                <p
                  className="text-center mb-4"
                  style={{ fontSize: `${descriptionTextSize}px` || "24px" }}
                >
                  {dispenser.description}
                </p>
              )}

              {!!shouldDisplayRewards && (
                <RewardsUI
                  inStockMintAddresses={inStockMintAddresses}
                  dispenserId={dispenserId}
                  rewardDisplayType={
                    rewardDisplayType
                      ? rewardDisplayType
                      : RewardDisplayTypes.LIST
                  }
                />
              )}

              {!hasStock && hasFetchedBalances && !isFetchingBalances && (
                <p className="text-center my-4">
                  This dispenser is out of stock!
                </p>
              )}
              {/* {isBeingEdited || !!hasPassedCooldownCheck ? ( */}
              {true ? (
                <button
                  style={{
                    backgroundColor: claimButtonColor || "transparent",
                    color: claimButtonTextColor,
                    fontSize: `${claimButtonTextSize}px` || "24px",
                  }}
                  className={classNames([
                    "rounded-xl p-4 py-2 uppercase border border-gray-800 hover:border-gray-800 font-bold transition-colors duration-300 ease-in-out mt-4",
                    {
                      "opacity-50 cursor-not-allowed": isClaiming || !hasStock,
                    },
                  ])}
                  onClick={
                    isBeingEdited
                      ? (ev) => {
                          ev.preventDefault();
                        }
                      : handleClaim
                  }
                  disabled={isClaiming || !hasStock}
                >
                  {isClaiming ? <Spinner /> : claimButtonText || "Claim"}
                </button>
              ) : (
                <>
                  {hasCooldown ? (
                    <div className="text-2xl text-center space-y-2">
                      <div>{`You just claimed ${lastClaimTimeString} ago.`}</div>

                      <div>
                        {" "}
                        {`You can claim again in ${nextClaimTimeString}.`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl text-center space-y-2">
                      <div>You have already claimed from this dispenser.</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {children}
        </div>
      )}
    </>
  );
}

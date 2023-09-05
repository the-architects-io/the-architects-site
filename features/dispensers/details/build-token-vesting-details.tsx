import { Dispenser } from "@/app/blueprint/types";
import { LastClaimTimeDetails } from "@/features/dispensers/details/last-claim-time-details";
import { getAmountWithDecimals } from "@/utils/currency";
import { calculateTokenClaimRewardAmount } from "@/utils/dispensers/calculate-token-claim-reward-amount";
import { formatNumberWithCommas } from "@/utils/formatting";
import { PublicKey } from "@solana/web3.js";
import Spinner from "features/UI/spinner";
import { useCallback, useEffect, useState } from "react";
import { dayjs } from "utils/date-time";

export enum TokenClaimPayoutStrategies {
  VESTING_BUILD_TOKEN = "VESTING_BUILD_TOKEN",
  BASIC_CLAIM = "BASIC_CLAIM",
}

interface Props {
  walletAddress: PublicKey | null;
  numberOfDaoNftsHeld?: number;
  lastClaimTime?: string;
  tokenClaimSource: Dispenser;
  isEnabledClaim: boolean;
  hasBeenFetched: boolean;
  isLoading: boolean;
  setIsEnabledClaim?: (isEnabledClaim: boolean) => void;
}

export const BuildTokenVestingDetails = ({
  walletAddress,
  numberOfDaoNftsHeld,
  lastClaimTime,
  hasBeenFetched,
  tokenClaimSource,
  isEnabledClaim,
  isLoading,
  setIsEnabledClaim,
}: Props) => {
  const [rewardAmount, setRewardAmount] = useState(0);

  const calculateRewardAmount = useCallback(() => {
    const amount = calculateTokenClaimRewardAmount(
      lastClaimTime,
      tokenClaimSource,
      numberOfDaoNftsHeld || 0
    );
    setRewardAmount(amount);
    setIsEnabledClaim && setIsEnabledClaim(rewardAmount > 0);
  }, [
    lastClaimTime,
    numberOfDaoNftsHeld,
    setRewardAmount,
    tokenClaimSource,
    setIsEnabledClaim,
    rewardAmount,
  ]);

  useEffect(() => {
    if (!walletAddress) return;
    if (numberOfDaoNftsHeld) {
      calculateRewardAmount();
      return;
    }
  }, [
    walletAddress,
    setIsEnabledClaim,
    hasBeenFetched,
    numberOfDaoNftsHeld,
    calculateRewardAmount,
    lastClaimTime,
  ]);

  if (isLoading) {
    return (
      <div className="bg-stone-700 p-6 rounded-xl space-y-4 flex flex-col items-center text-2xl mb-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-stone-700 p-6 rounded-xl space-y-4 flex flex-col items-center text-2xl mb-8">
      <>
        {numberOfDaoNftsHeld && numberOfDaoNftsHeld > 0 ? (
          <div className="flex space-x-2">
            <div>Architects NFTs held:</div>
            <div>{numberOfDaoNftsHeld}</div>
          </div>
        ) : (
          <div className="max-w-sm text-3xl text-center tracking-wide leading-10">
            You must hold at least 1 Architects NFT to claim.
          </div>
        )}

        {rewardAmount > 0 && (
          <div className="flex space-x-2">
            <div>$BUILD available to claim:</div>
            <div>
              {formatNumberWithCommas(getAmountWithDecimals(rewardAmount, 2))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <div>Days of accrued earnings:</div>
          <div>{dayjs().diff(dayjs(lastClaimTime), "day")}</div>
        </div>

        <LastClaimTimeDetails
          cooldownInHours={24}
          lastClaimTime={lastClaimTime}
          isEnabledClaim={isEnabledClaim}
        />
      </>
    </div>
  );
};

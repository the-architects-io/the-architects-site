import {
  Dispenser,
  TokenClaimPayoutStrategies,
} from "@/features/admin/dispensers/dispensers-list-item";
import { diffInDays, diffInHours } from "utils/date-time";

const CUMULATIVE_ACCRUAL = 10500;

export const caluclateBuildVestingRewardAmount = (
  numberOfDaoNftsHeld: number,
  lastClaimTime: string | undefined
) => {
  const baseClaimAmount = 1000; // 10.00 $BUILD

  if (!lastClaimTime) return baseClaimAmount * numberOfDaoNftsHeld;

  const daysSinceLastClaim = diffInDays(lastClaimTime);

  if (daysSinceLastClaim < 1) {
    return 0;
  }

  if (daysSinceLastClaim >= 20) {
    return CUMULATIVE_ACCRUAL * numberOfDaoNftsHeld;
  }

  const amount =
    (baseClaimAmount - (daysSinceLastClaim - 1) * 25) *
    daysSinceLastClaim *
    numberOfDaoNftsHeld;

  console.log({
    baseClaimAmount,
    daysSinceLastClaim,
    numberOfDaoNftsHeld,
    amount,
  });

  return amount;
};

export const calculateTokenClaimRewardAmount = (
  lastClaimTime: string | undefined,
  dispenser: Dispenser,
  numberOfDaoNftsHeld?: number,
  strategy = TokenClaimPayoutStrategies.VESTING_BUILD_TOKEN
) => {
  switch (strategy) {
    case TokenClaimPayoutStrategies.VESTING_BUILD_TOKEN:
      if (!numberOfDaoNftsHeld) return 0;
      return caluclateBuildVestingRewardAmount(
        numberOfDaoNftsHeld,
        lastClaimTime
      );
    default:
      return 0;
  }
};

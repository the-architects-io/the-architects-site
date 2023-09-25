import { Dispenser, TokenClaimPayoutStrategies } from "@/app/blueprint/types";
import { fromBaseUnit, toBaseUnit } from "@/utils/currency";
import { diffInDays } from "@/utils/date-time";

export const CUMULATIVE_ACCRUAL = 10500;

export const caluclateBuildVestingRewardAmount = (
  numberOfDaoNftsHeld: number,
  lastClaimTime: string | undefined
) => {
  const baseClaimAmountBaseUnit = 1000; // 10.00 $BUILD

  if (!lastClaimTime)
    return fromBaseUnit(baseClaimAmountBaseUnit * numberOfDaoNftsHeld, 2);

  if (numberOfDaoNftsHeld < 0 || Number(lastClaimTime) < 0) {
    throw new Error("Invalid input");
  }

  const daysSinceLastClaim = diffInDays(lastClaimTime);

  if (daysSinceLastClaim < 1) {
    return 0;
  }

  if (daysSinceLastClaim >= 20) {
    return fromBaseUnit(CUMULATIVE_ACCRUAL * numberOfDaoNftsHeld, 2);
  }

  const reduction = Math.max(0, daysSinceLastClaim - 1) * 25;

  const amount =
    (baseClaimAmountBaseUnit - reduction) *
    daysSinceLastClaim *
    numberOfDaoNftsHeld;

  return fromBaseUnit(amount, 2);
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

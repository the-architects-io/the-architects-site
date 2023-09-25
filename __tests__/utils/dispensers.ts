import "@/utils/date-time";
import { Dispenser, TokenClaimPayoutStrategies } from "@/app/blueprint/types";
import {
  CUMULATIVE_ACCRUAL,
  calculateTokenClaimRewardAmount,
  caluclateBuildVestingRewardAmount,
} from "@/utils/dispensers/calculate-token-claim-reward-amount";
import { fromBaseUnit } from "@/utils/currency";

const mockDispenser = {
  id: "1",
  name: "Test Dispenser",
  description: "Test Dispenser Description",
} as Dispenser;

const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

const zeroDaysAgo = new Date(Date.now()).toISOString();

const now = new Date();
const oneDayInMs = 24 * 60 * 60 * 1000;

const oneDayAndTenMinutesAgo = new Date(
  now.getTime() - oneDayInMs - 10 * 60 * 1000
).toISOString();

const twoDaysAndTenMinutesAgo = new Date(
  now.getTime() - 2 * oneDayInMs - 10 * 60 * 1000
).toISOString();

const threeDaysAndTenMinutesAgo = new Date(
  now.getTime() - 3 * oneDayInMs - 10 * 60 * 1000
).toISOString();

const twentyOneDaysAndTenMinutesAgo = new Date(
  now.getTime() - 21 * oneDayInMs - 10 * 60 * 1000
).toISOString();

const baseAmount = 1000;
const reductionPerDay = 25;

let numberOfNfts = 0;

describe("Calculate $BUILD token vesting strategy payouts", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockImplementation(() => 0);
    numberOfNfts = Math.floor(Math.random() * 100); // 1 - 100
  });
  it("pays out 10 tokens on first claim and one day", () => {
    expect(
      calculateTokenClaimRewardAmount(
        oneDayAndTenMinutesAgo,
        mockDispenser,
        numberOfNfts,
        TokenClaimPayoutStrategies.VESTING_BUILD_TOKEN
      )
    ).toBe(numberOfNfts * 10);

    expect(
      calculateTokenClaimRewardAmount(
        undefined,
        mockDispenser,
        numberOfNfts,
        TokenClaimPayoutStrategies.VESTING_BUILD_TOKEN
      )
    ).toBe(numberOfNfts * 10);
  });

  it("returns calculated reward for 1 <= daysSinceLastClaim < 20", () => {
    let daysSinceLastClaim = 2;

    let reduction = (daysSinceLastClaim - 1) * reductionPerDay;
    let rawAmount = (baseAmount - reduction) * daysSinceLastClaim;
    let expectedAmount = fromBaseUnit(rawAmount, 2);

    expect(caluclateBuildVestingRewardAmount(1, twoDaysAndTenMinutesAgo)).toBe(
      expectedAmount
    );

    daysSinceLastClaim = 3;

    reduction = (daysSinceLastClaim - 1) * reductionPerDay;
    rawAmount = (baseAmount - reduction) * daysSinceLastClaim;
    expectedAmount = fromBaseUnit(rawAmount, 2);

    expect(
      caluclateBuildVestingRewardAmount(1, threeDaysAndTenMinutesAgo)
    ).toBe(expectedAmount);
  });

  it("returns correct reward for daysSinceLastClaim >= 20", () => {
    const daysSinceLastClaim = 21;

    const reduction = (daysSinceLastClaim - 1) * reductionPerDay;
    const rawAmount = (baseAmount - reduction) * daysSinceLastClaim;
    const expectedAmount = fromBaseUnit(rawAmount, 2);

    expect(
      caluclateBuildVestingRewardAmount(1, twentyOneDaysAndTenMinutesAgo)
    ).toBe(expectedAmount);
  });

  it("returns 0 for daysSinceLastClaim of 0", () => {
    expect(caluclateBuildVestingRewardAmount(1, zeroDaysAgo)).toBe(0);
  });

  it("handles maximum number of NFTs", () => {
    const maxNumberOfNfts = 10000;
    let daysSinceLastClaim = 21;

    let reduction = (daysSinceLastClaim - 1) * reductionPerDay;
    let rawAmount = (baseAmount - reduction) * daysSinceLastClaim;

    let expectedAmount = fromBaseUnit(rawAmount * maxNumberOfNfts, 2);

    expect(
      caluclateBuildVestingRewardAmount(
        maxNumberOfNfts,
        twentyOneDaysAndTenMinutesAgo
      )
    );

    daysSinceLastClaim = 2;
    reduction = (daysSinceLastClaim - 1) * reductionPerDay;
    rawAmount = (baseAmount - reduction) * daysSinceLastClaim;

    expectedAmount = fromBaseUnit(rawAmount * maxNumberOfNfts, 2);

    expect(
      caluclateBuildVestingRewardAmount(
        maxNumberOfNfts,
        twoDaysAndTenMinutesAgo
      )
    ).toBe(expectedAmount);
  });

  it("returns correct reward for random daysSinceLastClaim and numberOfNfts", () => {
    const randomDays = Math.floor(Math.random() * 100);
    const randomNfts = Math.floor(Math.random() * 100);
    const randomDaysAgo = new Date(
      now.getTime() - randomDays * oneDayInMs - 10 * 60 * 1000
    ).toISOString();

    // Calculate expectedAmount using the same logic as in function
    let expectedAmount;
    if (randomDays < 1) {
      expectedAmount = 0;
    } else if (randomDays >= 20) {
      expectedAmount = fromBaseUnit(CUMULATIVE_ACCRUAL * randomNfts, 2);
    } else {
      const reduction = (randomDays - 1) * reductionPerDay;
      const rawAmount = (baseAmount - reduction) * randomDays * randomNfts;
      expectedAmount = fromBaseUnit(rawAmount, 2);
    }

    expect(caluclateBuildVestingRewardAmount(randomNfts, randomDaysAgo)).toBe(
      expectedAmount
    );
  });

  it("returns 0 for numberOfNfts of 0", () => {
    expect(caluclateBuildVestingRewardAmount(0, oneDayAndTenMinutesAgo)).toBe(
      0
    );
  });

  it("throws error for invalid input", () => {
    expect(() =>
      caluclateBuildVestingRewardAmount(-1, oneDayAndTenMinutesAgo)
    ).toThrow(Error);

    expect(() => caluclateBuildVestingRewardAmount(-1, "asdf")).toThrow(Error);
  });

  it("returns precise rewards without floating point errors", () => {
    const daysSinceLastClaim = 3;
    const numberOfNfts = 100;

    const reduction = (daysSinceLastClaim - 1) * reductionPerDay;
    const rawAmount =
      (baseAmount - reduction) * daysSinceLastClaim * numberOfNfts;
    const expectedAmount = fromBaseUnit(rawAmount, 2);

    expect(
      caluclateBuildVestingRewardAmount(numberOfNfts, threeDaysAndTenMinutesAgo)
    ).toBeCloseTo(expectedAmount, 2);
  });
});

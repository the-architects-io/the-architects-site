export const getRawAmount = (amount: string | number, decimals: number) => {
  return Number(amount) * 10 ** decimals;
};

export const getAmountWithDecimals = (
  amount: string | number,
  decimals: number,
  roundToTwoDecimals = false
) => {
  let value = Number(amount) / 10 ** decimals;
  if (roundToTwoDecimals) {
    value = Math.round(value * 100) / 100;
  }

  return value;
};

export const getBuildAmountRaw = (amount: string | number) => {
  return getRawAmount(amount, 2);
};

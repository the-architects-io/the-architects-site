export const getRawAmount = (amount: string | number, decimals: number) => {
  return Number(amount) * 10 ** decimals;
};

export const getAmountWithDecimals = (
  amount: string | number,
  decimals: number
) => {
  return Number(amount) / 10 ** decimals;
};

export const getBuildAmountRaw = (amount: string | number) => {
  return getRawAmount(amount, 2);
};

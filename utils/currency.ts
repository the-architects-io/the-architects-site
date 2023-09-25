const MAX_DECIMALS = 100;

/**
 * Convert an amount to its base unit by multiplying it by 10 to the power of the specified number of decimals.
 * @param amount - The amount to convert to the base unit, as a string or number.
 * @param decimals - The number of decimal places used by the currency.
 * @returns The amount in the base unit as a number.
 */
export const toBaseUnit = (amount: string | number, decimals: number) => {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error(
      "Invalid decimals value. Decimals must be a non-negative integer."
    );
  }

  if (typeof amount === "string" && isNaN(Number(amount))) {
    throw new Error(
      "Invalid amount. Amount must be a number or numeric string."
    );
  }

  if (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_DECIMALS) {
    throw new Error(
      "Invalid decimals value. Decimals must be a non-negative integer and less than SOME_MAX_VALUE."
    );
  }

  return Number(amount) * 10 ** decimals;
};

/**
 * Convert an amount from its base unit to a human-readable format by dividing by 10 to the power of the specified number of decimals.
 * @param amount - The amount in the base unit to convert, as a string or number.
 * @param decimals - The number of decimal places used by the currency.
 * @param roundToTwoDecimals - Optionally round the result to two decimal places.
 * @returns The amount in human-readable format as a number.
 */
export const fromBaseUnit = (
  amount: string | number,
  decimals: number,
  roundToTwoDecimals = false
) => {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error(
      "Invalid decimals value. Decimals must be a non-negative integer."
    );
  }

  if (typeof amount === "string" && isNaN(Number(amount))) {
    throw new Error(
      "Invalid amount. Amount must be a number or numeric string."
    );
  }

  let value = Number(amount) / 10 ** decimals;
  if (roundToTwoDecimals) {
    value = Math.round(value * 100) / 100;
  }

  if (!Number.isInteger(decimals) || decimals < 0 || decimals > MAX_DECIMALS) {
    throw new Error(
      "Invalid decimals value. Decimals must be a non-negative integer and less than SOME_MAX_VALUE."
    );
  }

  return value;
};

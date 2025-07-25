export const getAbbreviatedAddress = (
  address: string,
  identifierLength: number = 4
) => {
  if (!address) return "";
  return `${address.slice(0, identifierLength)}...${address.slice(
    address.length - identifierLength
  )}`;
};

export const formatNumberWithCommas = (num: number) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const round = (num: number, decimalPlaces = 0) => {
  var p = Math.pow(10, decimalPlaces);
  var n = num * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
};

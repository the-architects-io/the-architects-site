import jsSHA from "jssha";

export const createHash = (data: string, outputLength = 16) => {
  const encoder = new jsSHA("SHAKE256", "TEXT");
  encoder.update(data);
  return encoder.getHash("HEX", { outputLen: outputLength });
};

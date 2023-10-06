import jsSHA from "jssha";
import crypto from "crypto";

export const createHash = (data: string, outputLength = 16) => {
  const encoder = new jsSHA("SHAKE256", "TEXT");
  encoder.update(data);
  return encoder.getHash("HEX", { outputLen: outputLength });
};

function generateHMAC(data: string, secret: string) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(data);
  return hmac.digest("hex");
}

function verifyHMAC(receivedHMAC: string, data: string, secret: string) {
  const ourHMAC = generateHMAC(data, secret);
  return ourHMAC === receivedHMAC;
}

import { BASE_URL } from "@/constants/constants";

export async function computeSignature(
  data: string,
  nonce: string,
  timestamp: string,
  clientMetadata: string
) {
  const payload = `${data}${nonce}${clientMetadata}${timestamp}`;

  // Convert the string to an array of bytes
  const encoder = new TextEncoder();
  const dataAsBytes = encoder.encode(data);

  // Hash the data
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataAsBytes);

  // Convert the hash to a hex string for easier transport
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

export const generateSignedPayload = async (
  data: string,
  timestamp: string
) => {
  // Fetch the one-time nonce.
  const response = await fetch(`${BASE_URL}/api/get-one-time-token`, {
    method: "POST",
  });
  const { token: nonce } = await response.json();

  const clientMetadata = navigator.userAgent;
  const payload = `${data}${nonce}${clientMetadata}${timestamp}`;
  const signature = await computeSignature(
    data,
    nonce,
    timestamp,
    clientMetadata
  );

  return {
    signature,
    timestamp,
    nonce,
  };
};

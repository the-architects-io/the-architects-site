import { BlueprintApiActions } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { generateSignedPayload } from "@/utils/get-signature-from-one-time-token";

export async function sendBlueprintRequest(payload: {
  action: BlueprintApiActions;
  params: any;
}) {
  const timestamp = Date.now().toString();

  const { signature, nonce } = await generateSignedPayload(
    JSON.stringify(payload.params),
    timestamp
  );

  const response = await fetch(`${BASE_URL}/api/blueprint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Timestamp": timestamp,
      "X-Signature": signature,
      "X-Nonce": nonce,
    },
    body: JSON.stringify(payload),
  });

  // Handle the response as necessary
  const responseData = await response.json();
  console.log({ responseData });

  // refactor response to pass message for client (e.g. "Character already exists")
  return responseData;
}

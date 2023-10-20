import { BlueprintApiActions } from "@/app/blueprint/types";
import { BASE_URL, ENV } from "@/constants/constants";
import { logMappedError, mapErrorToResponse } from "@/utils/errors/log-error";
import { computeSignature } from "@/utils/get-signature-from-one-time-token";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

const {
  ADD_CHARACTERS_FROM_NFTS,
  ADD_COST_COLLECTIONS,
  ADD_ITEM_COLLECTIONS,
  ADD_ITEMS,
  ADD_NFTS,
  ADD_TOKEN,
  ADD_TOKENS,
  BIND_ITEM_TO_TOKEN,
  CREATE_DISPENSER,
  DISPENSE_TOKENS,
  GET_TOKEN_BALANCES_FROM_HELIUS,
  GET_TOKEN_METADATA_FROM_HELIUS,
  LINK_WALLET_TO_USER,
  MINT_TOKEN,
  UPDATE_DISPENSER,
  UPDATE_DISPENSER_DISPLAY,
  UPDATE_DISPENSER_REWARDS,
  UNBIND_ITEM_FROM_TOKEN,
  UNBIND_WALLET_FROM_USER,
} = BlueprintApiActions;

const BlueprintApiActionUrls: {
  [key in BlueprintApiActions]: string;
} = {
  [ADD_CHARACTERS_FROM_NFTS]: `${BASE_URL}/api/add-characters-from-nfts`,
  [ADD_COST_COLLECTIONS]: `${BASE_URL}/api/add-cost-collections`,
  [ADD_ITEM_COLLECTIONS]: `${BASE_URL}/api/add-item-collections`,
  [ADD_ITEMS]: `${BASE_URL}/api/add-items`,
  [ADD_NFTS]: `${BASE_URL}/api/add-nfts`,
  [ADD_TOKEN]: `${BASE_URL}/api/add-token`,
  [ADD_TOKENS]: `${BASE_URL}/api/add-tokens`,
  [BIND_ITEM_TO_TOKEN]: `${BASE_URL}/api/bind-item-to-token`,
  [CREATE_DISPENSER]: `${BASE_URL}/api/add-dispenser`,
  [DISPENSE_TOKENS]: `${BASE_URL}/api/dispense-tokens`,
  [GET_TOKEN_BALANCES_FROM_HELIUS]: `${BASE_URL}/api/get-token-balances-from-helius`,
  [GET_TOKEN_METADATA_FROM_HELIUS]: `${BASE_URL}/api/get-token-metadata-from-helius`,
  [LINK_WALLET_TO_USER]: `${BASE_URL}/api/link-wallet-to-user`,
  [MINT_TOKEN]: `${BASE_URL}/api/mint-token`,
  [UPDATE_DISPENSER]: `${BASE_URL}/api/update-dispenser`,
  [UPDATE_DISPENSER_DISPLAY]: `${BASE_URL}/api/update-dispenser-display`,
  [UPDATE_DISPENSER_REWARDS]: `${BASE_URL}/api/update-dispenser-rewards`,
  [UNBIND_ITEM_FROM_TOKEN]: `${BASE_URL}/api/unbind-item-from-token`,
  [UNBIND_WALLET_FROM_USER]: `${BASE_URL}/api/unbind-wallet-from-user`,
};

class RequestHandlerBuilder {
  constructor(private action: string, private url: string) {}

  build() {
    return async (params: any) => {
      console.log({
        BlueprintApiActionUrls,
        action: this.action,
        params,
        apiKey: process.env.BLUEPRINT_API_KEY,
        url: this.url,
      });

      try {
        const { data, status, statusText, config } = await axios.post(
          this.url,
          {
            ...params,
            apiKey: process.env.BLUEPRINT_API_KEY,
          }
        );

        return NextResponse.json({
          ...data,
          status: data?.status || status || 500,
          statusText: data?.status !== 200 ? data?.statusText : statusText,
          config,
          action: this.action,
          params,
        });
      } catch (rawError: any) {
        const { error, status } = mapErrorToResponse(rawError);
        logMappedError({ error, status });
        return NextResponse.json({ error }, { status });
      }
    };
  }
}

const handlers = Object.keys(BlueprintApiActions).reduce((acc, actionKey) => {
  const action = actionKey as BlueprintApiActions;
  acc[action] = new RequestHandlerBuilder(
    action,
    BlueprintApiActionUrls[action]
  ).build();
  return acc;
}, {} as Record<string, Function>);

const oneTimeNoncesCache: Record<string, boolean> = {};

export async function POST(req: NextRequest) {
  const signatureHeader = req.headers.get("x-signature");
  const timestampHeader = req.headers.get("x-timestamp");
  const nonceHeader = req.headers.get("x-nonce");

  console.log({
    signatureHeader,
    timestampHeader,
    nonceHeader,
  });

  if (!signatureHeader || !timestampHeader || !nonceHeader) {
    return NextResponse.json(
      { error: "Missing required headers" },
      { status: 400 }
    );
  }

  // Check if nonce has been used before
  if (oneTimeNoncesCache[nonceHeader]) {
    return NextResponse.json(
      { error: "Nonce has been used before" },
      { status: 401 }
    );
  }

  // Construct the payload from body and verify the signature
  const { action, params } = await req.json();
  const clientMetadata = req.headers.get("User-Agent") || "";
  const dataToVerify = `${JSON.stringify(
    params
  )}${nonceHeader}${clientMetadata}${timestampHeader}`;

  const isValidSignature = await verifySignature(
    dataToVerify,
    nonceHeader,
    signatureHeader,
    clientMetadata
  );

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Mark nonce as used
  oneTimeNoncesCache[nonceHeader] = true;

  // Existing logic follows...
  if (!action) {
    return NextResponse.json({ error: "No action provided" }, { status: 500 });
  }

  const typedAction = action as BlueprintApiActions | string;

  if (typedAction in BlueprintApiActionUrls) {
    if (handlers[typedAction]) {
      return handlers[typedAction](params);
    }
  } else {
    return NextResponse.json({
      error: "Invalid action",
      status: 500,
    });
  }
}

async function verifySignature(
  data: string,
  nonce: string,
  providedSignature: string,
  clientMetadata: string
): Promise<boolean> {
  console.log({
    data,
    nonce,
    providedSignature,
    clientMetadata,
  });
  const computedSignature = await computeSignature(
    data,
    nonce,
    Date.now().toString(),
    clientMetadata
  );

  console.log({
    computedSignature,
    providedSignature,
  });

  return computedSignature === providedSignature;
}

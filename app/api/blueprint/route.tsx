import { BlueprintApiActions } from "@/app/blueprint/types";
import { BASE_URL, ENV } from "@/constants/constants";
import { logMappedError, mapErrorToResponse } from "@/utils/errors/log-error";
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

//... (your imports and constants)

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

export async function POST(req: NextRequest) {
  const { action, params } = await req.json();

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

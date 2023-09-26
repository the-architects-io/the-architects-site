import { BlueprintApiActions } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

const { CREATE_DISENSER, DISPENSE_TOKENS } = BlueprintApiActions;

const BlueprintApiActionUrls = {
  [CREATE_DISENSER]: `${BASE_URL}/api/add-dispenser`,
  [DISPENSE_TOKENS]: `${BASE_URL}/api/dispense-tokens`,
};

const handleCreateDispenser = async (params: any) => {
  const { data, status, statusText, config } = await axios.post(
    BlueprintApiActionUrls[CREATE_DISENSER],
    {
      ...params,
      apiKey: process.env.BLUEPRINT_API_KEY,
    }
  );

  return NextResponse.json({
    data,
    status: data?.status || 500,
    statusText: data?.status !== 200 ? data?.statusText : statusText,
    config,
    action: CREATE_DISENSER,
    params,
  });
};

const handleDispenseTokens = async (params: any) => {
  try {
    const { data, status, statusText, config } = await axios.post(
      BlueprintApiActionUrls[DISPENSE_TOKENS],
      {
        ...params,
        apiKey: process.env.BLUEPRINT_API_KEY,
      }
    );

    console.log({
      data,
      status,
    });

    return NextResponse.json(
      {
        data,
        status: status || 500,
        statusText,
        config,
        action: DISPENSE_TOKENS,
        params,
      },
      {
        status: status || 500,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error,
        status: 500,
      },
      {
        status: 500,
      }
    );
  }
};

export async function POST(req: NextRequest) {
  const { action, params, noop } = await req.json();

  if (noop) {
    return NextResponse.json(
      {
        noop: true,
        endpoint: "blueprint",
      },
      { status: 200 }
    );
  }

  switch (action) {
    // use string ver of enum
    case BlueprintApiActions.CREATE_DISENSER:
      return handleCreateDispenser(params);
    case BlueprintApiActions.DISPENSE_TOKENS:
      return handleDispenseTokens(params);
    default:
      return NextResponse.json({
        error: "Invalid action",
        status: 500,
      });
  }
}

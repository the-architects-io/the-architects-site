import {
  BlueprintApiActions,
  MappedErrorResponse,
} from "@/app/blueprint/types";
import { BASE_URL, ENV } from "@/constants/constants";
import { logError } from "@/utils/errors/log-error";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

const { CREATE_DISENSER, DISPENSE_TOKENS } = BlueprintApiActions;

const BlueprintApiActionUrls = {
  [CREATE_DISENSER]: `${BASE_URL}/api/add-dispenser`,
  [DISPENSE_TOKENS]: `${BASE_URL}/api/dispense-tokens`,
};

const mapErrorToResponse = (error: any): MappedErrorResponse => {
  const status =
    error?.response?.status || error?.response?.data?.status || 500;
  console.log({
    statuses: {
      "error?.response?.status": error?.response?.status,
      "error?.response?.data?.status": error?.response?.data?.status,
      status: status,
    },
  });
  const statusText =
    error?.response?.data?.statusText || "Internal Server Error";
  const message = error?.response?.statusText || "Internal Server Error";
  const errorMessage = error?.response?.data?.error;

  return {
    status: status || 500,
    error: { message, errorMessage, status, statusText },
  };
};

const handleCreateDispenser = async (params: any) => {
  try {
    const { data, status, statusText, config } = await axios.post(
      BlueprintApiActionUrls[CREATE_DISENSER],
      {
        ...params,
        apiKey: process.env.BLUEPRINT_API_KEY,
      }
    );

    console.log("handleCreateDispenser", {
      status,
      config,
    });

    return NextResponse.json({
      data,
      status: data?.status || 500,
      statusText: data?.status !== 200 ? data?.statusText : statusText,
      config,
      action: CREATE_DISENSER,
      params,
    });
  } catch (rawError: any) {
    let error = mapErrorToResponse(rawError);

    logError(error);
    return NextResponse.json({ error });
  }
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
  } catch (rawError: any) {
    let { error, status } = mapErrorToResponse(rawError);

    logError({ error, status });
    return NextResponse.json({ error }, { status });
  }
};

export async function POST(req: NextRequest) {
  const { action, params, noop } = await req.json();

  if (!process.env.API_ACCESS_HOST_LIST) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  console.log("/api/blueprint", {
    "x-real-ip": req.headers.get("x-real-ip"),
    "x-forwarded-for": req.headers.get("x-forwarded-for"),
    "x-forwarded-host": req.headers.get("x-forwarded-host"),
    "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
    "x-forwarded-port": req.headers.get("x-forwarded-port"),
    "x-forwarded-path": req.headers.get("x-forwarded-path"),
    "x-forwarded-prefix": req.headers.get("x-forwarded-prefix"),
    "x-forwarded-uri": req.headers.get("x-forwarded-uri"),
    "x-forwarded-server": req.headers.get("x-forwarded-server"),
    host: req.headers.get("host"),
  });

  const hostWhitelist = process.env.API_ACCESS_HOST_LIST;
  const host = req.headers.get("x-forwarded-host") || "";
  const isValidHost = hostWhitelist.indexOf(host) > -1;

  if (ENV !== "local" && !isValidHost) {
    return NextResponse.json(
      {
        error: `API access not allowed for host: ${host}`,
        status: 500,
      },
      { status: 500 }
    );
  }

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

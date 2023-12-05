import {
  BlueprintApiActions,
  MappedErrorResponse,
} from "@/app/blueprint/types";
import { BASE_URL, ENV } from "@/constants/constants";
import { logError } from "@/utils/errors/log-error";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

const {
  ADD_AIRDROP_RECIPIENTS,
  CREATE_COLLECTION,
  CREATE_DISENSER,
  CREATE_TREE,
  DISPENSE_TOKENS,
  CREATE_AIRDROP,
  MINT_CNFT,
  MINT_NFT,
  UPLOAD_JSON,
  UPLOAD_FILE,
  UPLOAD_FILES,
} = BlueprintApiActions;

const BlueprintApiActionUrls = {
  [ADD_AIRDROP_RECIPIENTS]: `${BASE_URL}/api/add-airdrop-recipients`,
  [CREATE_AIRDROP]: `${BASE_URL}/api/add-airdrop`,
  [CREATE_COLLECTION]: `${BASE_URL}/api/add-collection`,
  [CREATE_DISENSER]: `${BASE_URL}/api/add-dispenser`,
  [CREATE_TREE]: `${BASE_URL}/api/create-tree`,
  [DISPENSE_TOKENS]: `${BASE_URL}/api/dispense-tokens`,
  [MINT_CNFT]: `${BASE_URL}/api/mint-cnft`,
  [MINT_NFT]: `${BASE_URL}/api/mint-nft`,
  [UPLOAD_JSON]: `${BASE_URL}/api/upload-json-file-to-shadow-drive`,
  [UPLOAD_FILE]: `${BASE_URL}/api/upload-file-to-shadow-drive`,
  [UPLOAD_FILES]: `${BASE_URL}/api/upload-files-to-shadow-drive`,
};

export const mapErrorToResponse = (error: any): MappedErrorResponse => {
  const status =
    error?.response?.status || error?.response?.data?.status || 500;
  console.log({
    error,
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

const handleBlueprintAction = async (
  action: BlueprintApiActions,
  params: any
) => {
  try {
    const { data, status, statusText } = await axios.post(
      BlueprintApiActionUrls[action],
      {
        ...params,
        apiKey: process.env.BLUEPRINT_API_KEY,
      }
    );

    return NextResponse.json(
      {
        status: status || 500,
        statusText,
        success: status === 200,
        action,
        params,
        ...data,
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

const handleAddAirdropRecipients = async (params: any) => {
  const { airdropId, recipients } = params;

  if (!airdropId || !recipients) {
    return NextResponse.json(
      {
        error: "Missing required params",
        status: 500,
      },
      { status: 500 }
    );
  }

  if (!process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "Blueprint API key not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  try {
    console.log("!!!!!!!!!");
    const { data, status, statusText } = await axios.post(
      BlueprintApiActionUrls[ADD_AIRDROP_RECIPIENTS],
      {
        ...params,
        apiKey: process.env.BLUEPRINT_API_KEY,
      }
    );

    return NextResponse.json(
      {
        ...data,
        status: status || 500,
        statusText,
        action: UPLOAD_FILE,
        success: status === 200,
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

const handleUploadFormData = async (
  action: BlueprintApiActions,
  formData: FormData | undefined
) => {
  console.log("sanity check");
  if (!process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "Blueprint API key not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  console.log("sanity check 2");

  if (!formData) {
    return NextResponse.json(
      {
        error: "Missing form data",
        status: 500,
      },
      { status: 500 }
    );
  }

  console.log("sanity check 3");

  formData.append("apiKey", process.env.BLUEPRINT_API_KEY);

  try {
    const { data, status, statusText } = await axios.post(
      BlueprintApiActionUrls[action],
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (data?.errors?.length) {
      return NextResponse.json({
        error: data?.errors[0],
        status: 500,
        statusText: "Error with upload to shadow drive",
        action: BlueprintApiActionUrls[action],
      });
    }

    return NextResponse.json({
      ...data,
      count: data?.count || 0,
      status: status || 500,
      statusText,
      action: BlueprintApiActionUrls[action],
      success: status === 200,
    });
  } catch (rawError: any) {
    let error = mapErrorToResponse(rawError);

    logError(error);
    return NextResponse.json({ error });
  }
};

const handleCreateDispenser = async (params: any) => {
  try {
    const { data, status, statusText } = await axios.post(
      BlueprintApiActionUrls[CREATE_DISENSER],
      {
        ...params,
        apiKey: process.env.BLUEPRINT_API_KEY,
      }
    );

    return NextResponse.json({
      ...data,
      status: data?.status || 500,
      statusText: data?.status !== 200 ? data?.statusText : statusText,
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
    const { data, status, statusText } = await axios.post(
      BlueprintApiActionUrls[DISPENSE_TOKENS],
      {
        ...params,
        apiKey: process.env.BLUEPRINT_API_KEY,
      }
    );

    return NextResponse.json(
      {
        status: status || 500,
        statusText,
        action: DISPENSE_TOKENS,
        params,
        ...data,
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

const handleJsonFileUpload = async (formData: FormData | undefined) => {
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@ handleJsonFileUpload", {
    formData,
  });
  if (!process.env.BLUEPRINT_API_KEY) {
    return NextResponse.json(
      {
        error: "Blueprint API key not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  if (!formData) {
    return NextResponse.json(
      {
        error: "Missing form data",
        status: 500,
      },
      { status: 500 }
    );
  }

  formData.append("apiKey", process.env.BLUEPRINT_API_KEY);

  console.log({ formData });

  try {
    const { data, status, statusText } = await axios.post(
      BlueprintApiActionUrls[UPLOAD_JSON],
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log({ data, status, statusText });

    if (data?.errors?.length) {
      return NextResponse.json({
        error: data?.errors[0],
        status: 500,
        statusText: "Error with upload to shadow drive",
        action: BlueprintApiActionUrls[UPLOAD_JSON],
      });
    }

    return NextResponse.json({
      ...data,
      status: status || 500,
      statusText,
      action: BlueprintApiActionUrls[UPLOAD_JSON],
      success: status === 200,
    });
  } catch (rawError: any) {
    let error = mapErrorToResponse(rawError);

    logError(error);
    return NextResponse.json({ error });
  }
};

export async function POST(req: NextRequest) {
  let action, params;

  console.log({ headers: req.headers.get("content-type") });

  if (req.headers.get("content-type") === "application/json") {
    const json = await req.json();
    action = json.action;
    params = json.params;
  } else {
    params = await req.formData();
    action = params.get("action");
  }

  if (!process.env.API_ACCESS_HOST_LIST) {
    return NextResponse.json(
      {
        error: "API access not configured",
        status: 500,
      },
      { status: 500 }
    );
  }

  // const hostWhitelist = process.env.API_ACCESS_HOST_LIST;
  // const host = req.headers.get("x-forwarded-host") || "";
  // const isValidHost = hostWhitelist.indexOf(host) > -1;

  // if (ENV !== "local" && !isValidHost) {
  //   return NextResponse.json(
  //     {
  //       error: `API access not allowed for host: ${host}`,
  //       status: 500,
  //     },
  //     { status: 500 }
  //   );
  // }

  switch (action) {
    case BlueprintApiActions.CREATE_AIRDROP:
    case BlueprintApiActions.CREATE_COLLECTION:
    case BlueprintApiActions.CREATE_TREE:
    case BlueprintApiActions.MINT_CNFT:
    case BlueprintApiActions.MINT_NFT:
      return handleBlueprintAction(action, params);
    case BlueprintApiActions.UPLOAD_FILE:
    case BlueprintApiActions.UPLOAD_FILES:
      return handleUploadFormData(action, params);
    case BlueprintApiActions.UPLOAD_JSON:
      return handleJsonFileUpload(params);
    case BlueprintApiActions.ADD_AIRDROP_RECIPIENTS:
      return handleAddAirdropRecipients(params);
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

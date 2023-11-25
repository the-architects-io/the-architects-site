import {
  AddAirdropRecipientsInput,
  AirdropRecipientsResponse,
  BlueprintApiActions,
  CreateAirdropInput,
  CreateAirdropResponse,
  UploadFileInput,
  UploadFileResponse,
} from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import axios from "axios";

export type BlueprintClientOptions = {
  cluster: "devnet" | "testnet" | "mainnet-beta";
};

const createAirdrop = async (
  options: BlueprintClientOptions,
  params: CreateAirdropInput
): Promise<CreateAirdropResponse> => {
  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.CREATE_AIRDROP,
      params,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
};

const addAirdropRecipients = async (
  options: BlueprintClientOptions,
  params: AddAirdropRecipientsInput
): Promise<AirdropRecipientsResponse> => {
  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.ADD_AIRDROP_RECIPIENTS,
      params,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
};

const uploadFile = async (
  options: BlueprintClientOptions,
  params: UploadFileInput
): Promise<UploadFileResponse> => {
  const { json, fileName, image, driveAddress } = params;

  if (!json && !image) {
    throw new Error("No file or json provided");
  }

  if (json && image) {
    throw new Error("Only image or json can be provided, not both");
  }

  const body = new FormData();

  if (json) body.set("json", JSON.stringify(json));
  if (image) body.set("image", image);
  body.set("fileName", fileName);
  body.set("action", BlueprintApiActions.UPLOAD_FILE);
  body.set("driveAddress", driveAddress);

  const { data } = await axios.post(`${BASE_URL}/api/blueprint`, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const createBlueprintClient = (options: BlueprintClientOptions) => {
  return {
    createAirdrop: (params: CreateAirdropInput) =>
      createAirdrop(options, params),
    addAirdropRecipients: (params: AddAirdropRecipientsInput) =>
      addAirdropRecipients(options, params),
    uploadFile: (params: UploadFileInput) => uploadFile(options, params),
  };
};

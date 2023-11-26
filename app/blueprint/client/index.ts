import { UploadAssetsToShadowDriveResponse } from "@/app/api/upload-json-to-shadow-drive/route";
import {
  AddAirdropRecipientsInput,
  AirdropRecipientsResponse,
  BlueprintApiActions,
  CreateAirdropInput,
  CreateAirdropResponse,
  MintNftInput,
  MintNftResponse,
  UploadFileInput,
  UploadFileResponse,
  UploadJsonInput,
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
  const { recipientsJsonFile, recipients, airdropId } = params;

  if (!recipientsJsonFile && !recipients) {
    throw new Error("No recipients provided");
  }

  if (recipientsJsonFile && recipients) {
    throw new Error(
      "Only recipients or recipientsJsonFile can be provided, not both"
    );
  }

  const body = new FormData();

  if (recipientsJsonFile) body.set("recipientsJsonFile", recipientsJsonFile);
  if (recipients) body.set("recipients", JSON.stringify(recipients));
  body.set("airdropId", airdropId);
  body.set("action", BlueprintApiActions.ADD_AIRDROP_RECIPIENTS);

  const { data } = await axios.post(`${BASE_URL}/api/blueprint`, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

const mintNft = async (
  options: BlueprintClientOptions,
  params: MintNftInput
): Promise<MintNftResponse> => {
  const { cluster } = options;

  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.MINT_NFT,
      params: {
        ...params,
        cluster,
      },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
};

const uploadJson = async (
  options: BlueprintClientOptions,
  params: UploadJsonInput
): Promise<UploadFileResponse> => {
  const { json, fileName } = params;

  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.UPLOAD_JSON,
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
  const { cluster } = options;
  const { file, fileName, driveAddress } = params;

  if (!file || !fileName || !driveAddress) {
    throw new Error("Missing required parameters");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", fileName);
  formData.append("driveAddress", driveAddress);
  formData.append("cluster", cluster);
  formData.append("action", BlueprintApiActions.UPLOAD_FILE);

  const { data } = await axios.post(`${BASE_URL}/api/blueprint`, formData, {
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
    mintNft: (params: MintNftInput) => mintNft(options, params),
    uploadFile: (params: UploadFileInput) => uploadFile(options, params),
    uploadJson: (params: UploadJsonInput) => uploadJson(options, params),
  };
};

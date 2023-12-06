import {
  AddAirdropRecipientsInput,
  AirdropRecipientsResponse,
  BlueprintApiActions,
  CreateAirdropInput,
  CreateAirdropResponse,
  CreateCollectionInput,
  CreateCollectionResponse,
  CreateTreeInput,
  CreateTreeResponse,
  MintCnftInput,
  MintCnftResponse,
  MintNftInput,
  MintNftResponse,
  UpdateCollectionInput,
  UploadFileInput,
  UploadFileResponse,
  UploadFilesInput,
  UploadFilesResponse,
  UploadJsonInput,
} from "@/app/blueprint/types";
import { jsonFileToJson } from "@/app/blueprint/utils";
import { BASE_URL } from "@/constants/constants";
import axios from "axios";

export type BlueprintClientOptions = {
  cluster: "devnet" | "testnet" | "mainnet-beta";
};

const createCollection = async (
  options: BlueprintClientOptions,
  params: CreateCollectionInput
): Promise<CreateCollectionResponse> => {
  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.CREATE_COLLECTION,
      params: { collection: params },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
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
  const { recipients: incomingRecipients, airdropId } = params;

  if (!incomingRecipients) {
    throw new Error("No recipients provided");
  }

  let recipients: string[] = [];
  debugger;

  const isJsonFile = (file: any) => {
    try {
      return file.type === "application/json";
    } catch (err) {
      return false;
    }
  };

  console.log({ incomingRecipients });

  if (isJsonFile(incomingRecipients)) {
    const json = await jsonFileToJson(incomingRecipients as File);
    recipients = json;
  } else {
    recipients = incomingRecipients as string[];
  }

  const { data } = await axios.post(`${BASE_URL}/api/blueprint`, {
    action: BlueprintApiActions.ADD_AIRDROP_RECIPIENTS,
    params: {
      recipients,
      airdropId,
    },
  });

  return data;
};

const createTree = async (
  options: BlueprintClientOptions,
  params: CreateTreeInput
): Promise<CreateTreeResponse> => {
  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.CREATE_TREE,
      params,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
};

const mintCnft = async (
  options: BlueprintClientOptions,
  params: MintCnftInput
): Promise<MintCnftResponse> => {
  const { cluster } = options;

  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.MINT_CNFT,
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

const updateCollection = async (
  options: BlueprintClientOptions,
  params: UpdateCollectionInput
): Promise<CreateCollectionResponse> => {
  const response = await fetch("/api/blueprint", {
    method: "POST",
    body: JSON.stringify({
      action: BlueprintApiActions.UPDATE_COLLECTION,
      params,
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

const uploadFiles = async (
  options: BlueprintClientOptions,
  params: UploadFilesInput
): Promise<UploadFilesResponse> => {
  const { files, driveAddress } = params;

  if (!files || !driveAddress) {
    throw new Error("Missing required parameters");
  }

  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@");
  console.log({ files });

  const formData = new FormData();
  formData.append("driveAddress", driveAddress);
  formData.append("action", BlueprintApiActions.UPLOAD_FILES);
  // @ts-ignore
  formData.append("files", files);

  const { data } = await axios.post(`${BASE_URL}/api/blueprint`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const createBlueprintClient = (options: BlueprintClientOptions) => {
  return {
    addAirdropRecipients: (params: AddAirdropRecipientsInput) =>
      addAirdropRecipients(options, params),
    createCollection: (params: CreateCollectionInput) =>
      createCollection(options, params),
    createAirdrop: (params: CreateAirdropInput) =>
      createAirdrop(options, params),
    createTree: (params: CreateTreeInput) => createTree(options, params),
    mintCnft: (params: MintCnftInput) => mintCnft(options, params),
    mintNft: (params: MintNftInput) => mintNft(options, params),
    updateCollection: (params: UpdateCollectionInput) =>
      updateCollection(options, params),
    uploadFile: (params: UploadFileInput) => uploadFile(options, params),
    uploadFiles: (params: UploadFilesInput) => uploadFiles(options, params),
    uploadJson: (params: UploadJsonInput) => uploadJson(options, params),
  };
};

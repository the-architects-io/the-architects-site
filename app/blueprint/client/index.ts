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

export const createAirdrop = async (
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

export const addAirdropRecipients = async (
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

export const uploadFile = async (
  params: UploadFileInput
): Promise<UploadFileResponse> => {
  const { fileName, file } = params;

  const body = new FormData();

  body.set("file", file);
  body.set("fileName", fileName);
  body.set("action", BlueprintApiActions.UPLOAD_FILE);

  const { data } = await axios.post(`${BASE_URL}/api/blueprint`, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

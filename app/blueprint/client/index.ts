import {
  AddAirdropRecipientsInput,
  AirdropRecipientsResponse,
  BlueprintApiActions,
  CreateAirdropInput,
  CreateAirdropResponse,
  CreateCollectionInput,
  CreateCollectionResponse,
  CreateDriveInput,
  CreateDriveResponse,
  CreateTreeInput,
  CreateTreeResponse,
  CreateUploadJobInput,
  CreateUploadJobResponse,
  DeleteDriveInput,
  DeleteDriveResponse,
  GetDriveInput,
  GetDriveResponse,
  GetDrivesInput,
  GetDrivesResponse,
  IncreaseStorageInput,
  IncreaseStorageResponse,
  MintCnftInput,
  MintCnftResponse,
  MintNftInput,
  MintNftResponse,
  ReduceStorageInput,
  ReduceStorageResponse,
  UpdateCollectionInput,
  UpdateCollectionResponse,
  UploadFileInput,
  UploadFileResponse,
  UploadFilesInput,
  UploadFilesResponse,
  UploadJsonInput,
  UploadJsonResponse,
} from "@/app/blueprint/types";
import { jsonFileToJson } from "@/app/blueprint/utils";
import { BASE_URL } from "@/constants/constants";
import axios from "axios";

export type BlueprintClientOptions = {
  cluster: "devnet" | "testnet" | "mainnet-beta";
};

const getFormData = async (params: Record<string, any>) => {
  const formData = new FormData();
  for (const key in params) {
    if (params[key] instanceof File) {
      const file = params[key] as File;
      if (file.type === "application/json") {
        const json = await jsonFileToJson(file);
        formData.append(key, JSON.stringify(json));
      } else {
        formData.append(key, file);
      }
    } else {
      formData.append(key, params[key]);
    }
  }
  return formData;
};

async function makeApiRequest<TResponse, TParams extends Record<string, any>>(
  action: BlueprintApiActions,
  params: TParams,
  options: BlueprintClientOptions,
  isFormData: boolean = false
): Promise<TResponse> {
  const url = `${BASE_URL}/api/blueprint`;

  let body: FormData | string;
  let headers = {};

  if (isFormData) {
    const formData = await getFormData(params);
    if (!formData) throw new Error("Failed to create form data");

    body = formData;
    headers = { "Content-Type": "multipart/form-data" };
  } else {
    body = JSON.stringify({ action, params, cluster: options.cluster });
    headers = { "Content-Type": "application/json" };
  }

  const response = await axios.post(url, body, { headers });
  return response.data;
}

export const createBlueprintClient = (options: BlueprintClientOptions) => {
  return {
    addAirdropRecipients: (params: AddAirdropRecipientsInput) =>
      makeApiRequest<AirdropRecipientsResponse, AddAirdropRecipientsInput>(
        BlueprintApiActions.ADD_AIRDROP_RECIPIENTS,
        params,
        options,
        true
      ),
    createCollection: (params: CreateCollectionInput) =>
      makeApiRequest<CreateCollectionResponse, CreateCollectionInput>(
        BlueprintApiActions.CREATE_COLLECTION,
        params,
        options
      ),
    createAirdrop: (params: CreateAirdropInput) =>
      makeApiRequest<CreateAirdropResponse, CreateAirdropInput>(
        BlueprintApiActions.CREATE_AIRDROP,
        params,
        options
      ),
    createDrive: (params: CreateDriveInput) =>
      makeApiRequest<CreateDriveResponse, CreateDriveInput>(
        BlueprintApiActions.CREATE_DRIVE,
        params,
        options
      ),
    createTree: (params: CreateTreeInput) =>
      makeApiRequest<CreateTreeResponse, CreateTreeInput>(
        BlueprintApiActions.CREATE_TREE,
        params,
        options
      ),

    createUploadJob: (params: CreateUploadJobInput) =>
      makeApiRequest<CreateUploadJobResponse, CreateUploadJobInput>(
        BlueprintApiActions.CREATE_UPLOAD_JOB,
        params,
        options
      ),
    deleteDrive: (params: DeleteDriveInput) =>
      makeApiRequest<DeleteDriveResponse, DeleteDriveInput>(
        BlueprintApiActions.DELETE_DRIVE,
        params,
        options
      ),

    getDrive: (params: GetDriveInput) =>
      makeApiRequest<GetDriveResponse, GetDriveInput>(
        BlueprintApiActions.GET_DRIVE,
        params,
        options
      ),
    getDrives: (params: GetDrivesInput) =>
      makeApiRequest<GetDrivesResponse, GetDrivesInput>(
        BlueprintApiActions.GET_DRIVES,
        params,
        options
      ),
    increaseStorage: (params: IncreaseStorageInput) =>
      makeApiRequest<IncreaseStorageResponse, IncreaseStorageInput>(
        BlueprintApiActions.INCREASE_STORAGE,
        params,
        options
      ),
    mintCnft: (params: MintCnftInput) =>
      makeApiRequest<MintCnftResponse, MintCnftInput>(
        BlueprintApiActions.MINT_CNFT,
        params,
        options
      ),
    mintNft: (params: MintNftInput) =>
      makeApiRequest<MintNftResponse, MintNftInput>(
        BlueprintApiActions.MINT_NFT,
        params,
        options
      ),
    reduceStorage: (params: ReduceStorageInput) =>
      makeApiRequest<ReduceStorageResponse, ReduceStorageInput>(
        BlueprintApiActions.REDUCE_STORAGE,
        params,
        options
      ),
    updateCollection: (params: UpdateCollectionInput) =>
      makeApiRequest<UpdateCollectionResponse, UpdateCollectionInput>(
        BlueprintApiActions.UPDATE_COLLECTION,
        params,
        options
      ),
    uploadFile: (params: UploadFileInput) =>
      makeApiRequest<UploadFileResponse, UploadFileInput>(
        BlueprintApiActions.UPLOAD_FILE,
        params,
        options,
        true
      ),

    uploadFiles: (params: UploadFilesInput) =>
      makeApiRequest<UploadFilesResponse, UploadFilesInput>(
        BlueprintApiActions.UPLOAD_FILES,
        params,
        options,
        true
      ),
    uploadJson: (params: UploadJsonInput) =>
      makeApiRequest<UploadJsonResponse, UploadJsonInput>(
        BlueprintApiActions.UPLOAD_JSON,
        params,
        options,
        true
      ),
  };
};

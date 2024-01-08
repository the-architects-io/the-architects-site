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
  CreateJobInput,
  CreateJobResponse,
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
  UpdateAirdropInput,
  UpdateAirdropRespone,
  UpdateCollectionInput,
  UpdateCollectionResponse,
  UpdateJobInput,
  UpdateJobResponse,
  UpdateUploadJobInput,
  UpdateUploadJobResponse,
  UploadFileInput,
  UploadFileResponse,
  UploadFilesInput,
  UploadFilesResponse,
  UploadJsonInput,
  UploadJsonResponse,
} from "@/app/blueprint/types";
import {
  getPremintCollectionMetadata,
  jsonFileToJson,
} from "@/app/blueprint/utils";
import { BASE_URL } from "@/constants/constants";
import axios from "axios";

export type BlueprintClientOptions = {
  cluster: "devnet" | "mainnet-beta";
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

  console.log({
    action,
    params,
    options,
    isFormData,
  });

  if (isFormData) {
    const formData = await getFormData(params);
    formData.append("action", action);
    if (!formData) throw new Error("Failed to create form data");

    body = formData;
    headers = { "Content-Type": "multipart/form-data" };
  } else {
    body = JSON.stringify({
      action,
      params: {
        ...params,
        cluster: options.cluster,
      },
    });
    headers = { "Content-Type": "application/json" };
  }

  if (!action) {
    console.error("Action not set");
    throw new Error("Action not set");
  }

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.log({ error });
    throw error;
  }
}

const collectionUtils = {
  getPremintCollectionMetadata,
};

export const createBlueprintClient = (options: BlueprintClientOptions) => {
  return {
    airdrops: {
      addAirdropRecipients: (params: AddAirdropRecipientsInput) =>
        makeApiRequest<AirdropRecipientsResponse, AddAirdropRecipientsInput>(
          BlueprintApiActions.ADD_AIRDROP_RECIPIENTS,
          params,
          options
        ),
      createAirdrop: (params: CreateAirdropInput) =>
        makeApiRequest<CreateAirdropResponse, CreateAirdropInput>(
          BlueprintApiActions.CREATE_AIRDROP,
          params,
          options
        ),
      updateAirdrop: (params: UpdateAirdropInput) =>
        makeApiRequest<UpdateAirdropRespone, UpdateAirdropInput>(
          BlueprintApiActions.UPDATE_AIRDROP,
          params,
          options
        ),
    },
    collections: {
      createCollection: (params: CreateCollectionInput) =>
        makeApiRequest<CreateCollectionResponse, CreateCollectionInput>(
          BlueprintApiActions.CREATE_COLLECTION,
          params,
          options
        ),
      updateCollection: (params: UpdateCollectionInput) =>
        makeApiRequest<UpdateCollectionResponse, UpdateCollectionInput>(
          BlueprintApiActions.UPDATE_COLLECTION,
          params,
          options
        ),
      ...collectionUtils,
    },
    drive: {
      createDrive: (params: CreateDriveInput) =>
        makeApiRequest<CreateDriveResponse, CreateDriveInput>(
          BlueprintApiActions.CREATE_DRIVE,
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
      reduceStorage: (params: ReduceStorageInput) =>
        makeApiRequest<ReduceStorageResponse, ReduceStorageInput>(
          BlueprintApiActions.REDUCE_STORAGE,
          params,
          options
        ),
    },
    jobs: {
      createJob: (params: CreateJobInput) =>
        makeApiRequest<CreateJobResponse, CreateJobInput>(
          BlueprintApiActions.CREATE_JOB,
          params,
          options
        ),
      createUploadJob: (params: CreateUploadJobInput) =>
        makeApiRequest<CreateUploadJobResponse, CreateUploadJobInput>(
          BlueprintApiActions.CREATE_UPLOAD_JOB,
          params,
          options
        ),
      updateJob: (params: UpdateJobInput) =>
        makeApiRequest<UpdateJobResponse, UpdateJobInput>(
          BlueprintApiActions.UPDATE_JOB,
          params,
          options
        ),
      updateUploadJob: (params: UpdateUploadJobInput) =>
        makeApiRequest<UpdateUploadJobResponse, UpdateUploadJobInput>(
          BlueprintApiActions.UPDATE_UPLOAD_JOB,
          params,
          options
        ),
    },
    tokens: {
      createTree: (params: CreateTreeInput) =>
        makeApiRequest<CreateTreeResponse, CreateTreeInput>(
          BlueprintApiActions.CREATE_TREE,
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
    },
    upload: {
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
    },
  };
};

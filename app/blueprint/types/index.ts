import { Community } from "@/features/admin/communities/communities-list-item";
import { RpcConfirmTransactionResult } from "@metaplex-foundation/umi";
import { User } from "@nhost/nextjs";
import { ShadowFile, StorageAccount } from "@shadow-drive/sdk";

export type ErrorResponse = {
  success: boolean;
  message: string;
};

export type ItemCollection = {
  amount: number;
  id: string;
  name: string;
  imageUrl: string;
  item: {
    id: string;
    name: string;
    imageUrl: string;
    token: {
      name: string;
      id: string;
      mintAddress: string;
      decimals: number;
    };
  };
};

export type DispenserRestriction = {
  id: string;
  trait: {
    name: string;
    id: string;
    value: string;
  };
};

export type DispenserReward = {
  name: string;
  balance?: number;
  amount?: number;
  id: string;
  imageUrl?: string;
  payoutChance: number;
  isFreezeOnDelivery: boolean;
  dispenserId: string;
  token?: {
    id: string;
    mintAddress: string;
    name: string;
    decimals: number;
  };
  hashList?: string;
  childRewards?: DispenserReward[];
  payoutSortOrder?: number;
};

export type DispenserGate = {
  id: string;
  trait: {
    name: string;
    id: string;
    value: string;
  };
};

export type CostCollection = {
  id: string;
  name: string;
  dispenserId: string;
  itemCollection: ItemCollection;
};

export type DispenserCost = {
  name: string;
  amount: number;
  id: string;
  imageUrl: string;
  token: {
    id: string;
    mintAddress: string;
    name: string;
  };
};

export type TraitBasedCollection = {
  id: string;
  traitCollection: {
    trait: {
      name: string;
      id: string;
    };
    value: string;
    id: string;
    name: string;
  };
};

export type RewardCollection = {
  id: string;
  name: string;
  payoutChance?: number;
  hashListCollection: HashListCollection;
  itemCollection: ItemCollection;
  childRewardCollections?: {
    id: string;
    name: string;
    hashListCollection: HashListCollection;
    itemCollection: ItemCollection;
  }[];
};

export type HashListCollection = {
  id: string;
  name: string;
  amount: number;
  hashList: {
    id: string;
    name: string;
    rawHashList: string;
  };
};

export type Account = {
  email: string;
  id: string;
  imageUrl: string;
  username: string;
  provider: {
    id: string;
    name: string;
  };
  user?: {
    email: string;
    id: string;
    imageUrl: string;
    name: string;
    primaryWallet: {
      id: string;
      address: string;
    };
  };
};

export type Character = {
  id: string;
  name: string;
  imageUrl: string;
  token: {
    id: string;
    mintAddress: string;
  };
  traitInstances: {
    id: string;
    value: string;
    trait: {
      id: string;
      name: string;
    };
  }[];
  traitCombinationHash?: string;
  mainCharacterActivityInstances: {
    id: string;
    startTime: string;
    endTime: string;
    isComplete: boolean;
    activity: {
      id: string;
      startTime: string;
      endTime: string;
    };
  }[];
};

export type NoopResponse = {
  noop: true;
  endpoint: string;
  returning?: unknown;
};

export type Wallet = {
  address: string;
  id: string;
  user?: User;
};

export enum TokenClaimPayoutStrategies {
  VESTING_BUILD_TOKEN = "VESTING_BUILD_TOKEN",
  BASIC_CLAIM = "BASIC_CLAIM",
}

export type Dispenser = {
  tokenClaimPayoutStrategy: TokenClaimPayoutStrategies;
  rewardWalletAddress: string;
  rewardWalletBump: number;
  cooldownInMs?: number;
  owner: {
    id: string;
  };
  collectionWallet: {
    id: string;
    address: string;
  };
  costCollections: {
    dispenserId: string;
    id: string;
    name: string;
    amount: number;
    itemCollection: ItemCollection;
  }[];
  rewardCollections: {
    dispenserId: string;
    payoutSortOrder?: number;
    childRewardCollections?: {
      payoutSortOrder?: number;
      dispenserId: string;
      isFreezeOnDelivery: boolean;
      hashListCollection: HashListCollection;
      payoutChance: number;
      itemCollection: ItemCollection;
      id: string;
      name: string;
    }[];
    isFreezeOnDelivery: boolean;
    hashListCollection: HashListCollection;
    payoutChance: number;
    itemCollection: ItemCollection;
    id: string;
    name: string;
  }[];
  restrictionCollections: {
    id: string;
    traitCollection: {
      trait: {
        name: string;
        id: string;
      };
      id: string;
      name: string;
      value: string;
    };
    hashListCollection: {
      name: string;
      hashList: {
        id: string;
        name: string;
      };
    };
  }[];
  gateCollections: {
    id: string;
    traitCollection: {
      id: string;
      name: string;
      value: string;
      trait: {
        id: string;
        name: string;
      };
    };
  }[];
  updatedAt: string;
  createdAt: string;
  description: string;
  id: string;
  name: string;
  isEnabled: boolean;
  imageUrl: string;
  rarity: {
    name: string;
    id: string;
  };
};

export type Token = {
  id: string;
  createdAt: string;
  decimals: number;
  imageUrl: string;
  mintAddress: string;
  name: string;
  symbol: string;
  items: {
    id: string;
    name: string;
  };
  nftCollection: {
    id: string;
    name: string;
  };
  isFungible: boolean;
  lastClaim: {
    id: string;
    createdAt: string;
  };
};

export type HeliusToken = {
  tokenAccount: string;
  mint: string;
  amount: number;
  decimals: number;
  id?: string;
};

export type TokenBalance = {
  costAmount?: number;
  costAmountString?: string;
  tokenAccount: string;
  mint: string;
  amount: number;
  decimals: number;
};

export enum LocalStorageKeys {
  DISPENSER_ID_BEING_CREATED = "dispenserIdBeingCreated",
}

export type Item = {
  rarity: {
    id: string;
    name: string;
  };
  costs: {
    amount: number;
    id: string;
    createdAt: string;
    token: {
      id: string;
      name: string;
      mintAddress: string;
    };
    item: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
  imageUrl: string;
  id: string;
  createdAt: string;
  isConsumable: boolean;
  isCraftable: boolean;
  name: string;

  description: string;
  itemCategory: {
    id: string;
    name: string;
    parentItemCategory: {
      name: string;
      id: string;
    };
    childItemCategories: {
      id: string;
      name: string;
    };
  };
  collections: {
    name: string;
    id: string;
    imageUrl: string;
  };
  token: {
    id: string;
    mintAddress: string;
  };
};

export enum TokenType {
  NFT = "NFT",
  CNFT = "CNFT",
}

export type Trait = {
  id: string;
  name: string;
  value: string;
};

export type TraitInstance = {
  id: string;
  value: string;
  trait: Trait;
};

export type MappedErrorResponse = {
  error: {
    message: string;
    errorMessage: string;
    status: number;
    statusText: string;
  };
  status: number;
};

export type DispenserDisplay = {
  backgroundColor: string;
  claimButtonColor: string;
  dispenser: {
    id: string;
  };
  id: string;
  shouldDisplayDescription: boolean;
  shouldDisplayImage: boolean;
  shouldDisplayName: boolean;
  shouldDisplayRewards: boolean;
  rewardDisplayType: string;
  textColor: string;
};

export enum RewardDisplayTypes {
  LIST = "LIST",
  CARDS = "CARDS",
}

export type DispenseTokensApiResponse = {
  txHash: string;
  mintAddress: string;
  amount: number;
  payout: {
    id: string;
    amount: number;
    token: {
      id: string;
      name: string;
      mintAddress: string;
    };
  };
  token: Token;
  item: Item;
};

export type NftMetadataJson = {
  name: string;
  image: string;
  mintAddress: string;
};

export enum RewardPayoutOrderTypes {
  RANDOM = "RANDOM",
  SEQUENTIAL = "SEQUENTIAL",
}

export type AddTokensResponse = {
  insert_tokens: {
    affected_rows: number;
    returning: Token[];
  };
};

export type AddCharactersResponse = {
  insert_characters: {
    affected_rows: number;
    returning: Character[];
  };
};

export type AddTraitsResponse = {
  insert_traits: {
    affected_rows: number;
    returning: Trait[];
  };
};

export type AddTraitInstancesResponse = {
  insert_traitInstances: {
    affected_rows: number;
    returning: TraitInstance[];
  };
};

export type Attribute = {
  trait_type: string;
  value: string;
};

export type ModeledNftMetadata = {
  traits?: Trait[];
  description: string;
  edition: number;
  url: string;
  name: string;
  imageUrl: string;
  mintAddress: string;
  creators: string[];
  fee: number;
  symbol: string;
  freezeAuthorityAddress: string;
  mintAuthorityAddress: string;
};

export enum LOCAL_OR_REMOTE {
  LOCAL = "local",
  REMOTE = "remote",
}

export type Recipient = {
  id: string;
  amount: number;
  wallet: Wallet;
};

export type Airdrop = {
  name: string;
  id: string;
  owner: {
    id: string;
  };
  recipients?: Recipient[];
  collectionNft?: {
    id: string;
    name: string;
    mintAddress: string;
  };
};

export type AddWalletsResponse = {
  message: string;
  wallets: Wallet[];
  existingWalletsCount: number;
  insertedWalletsCount: number;
};

export type AddAirdropResponse = {
  message: string;
  existingWalletsCount: number;
  insertedWalletsCount: number;
  addedReipientsCount: number;
  addedAirdrop: Airdrop;
};

export type CreateAirdropInput = {
  name: string;
  collectionNftId?: string;
  startTime?: string;
  ownerId?: string;
  shouldKickoffManually?: boolean;
};

export type BaseBlueprintResponse = {
  status: number;
  statusText: string;
  message: string;
  success: boolean;
  error?: string;
};

export type CreateAirdropResponse = BaseBlueprintResponse & {
  airdrop: Airdrop;
};

export type AddAirdropRecipientsInput = {
  airdropId: string;
  recipients: string[] | File;
};

export type AirdropRecipientsResponse = BaseBlueprintResponse & {
  airdrop: Airdrop;
  existingWalletsCount: number;
  insertedWalletsCount: number;
  addedReipientsCount: number;
};

export type UploadFileInput = {
  file: File;
  fileName: string;
  driveAddress: string;
};

export type UploadFileResponse = BaseBlueprintResponse & {
  url: string;
};

export type MintNftInput = {
  name: string;
  uri: string;
  sellerFeeBasisPoints: number;
  isCollection: boolean;
};

export type MintNftResponse = BaseBlueprintResponse & {
  mintAddress: string;
};

export type UploadJsonInput = {
  json: any;
  fileName: string;
  driveAddress: string;
};

export type UploadJsonResponse = BaseBlueprintResponse & {
  url: string;
};

export type MintCnftInput = {
  merkleTreeAddress: string;
  collectionNftAddress: string;
  creatorAddress: string;
  sellerFeeBasisPoints: number;
  name: string;
  uri: string;
  leafOwnerAddress: string;
};

export type MintCnftResponse = BaseBlueprintResponse & {
  signature: string;
  result: RpcConfirmTransactionResult;
  collectionAddress: string;
};

export type CreateTreeInput = {
  maxDepth: number;
  maxBufferSize: number;
};

export type CreateTreeResponse = BaseBlueprintResponse & {
  merkleTreeAddress: string;
};

export type UploadFilesInput = {
  files: ShadowFile[];
  driveAddress: string;
};

export type UploadFilesResponse = BaseBlueprintResponse & {
  urls: string[];
  count: number;
};

export type CreateCollectionInput = {
  name?: string;
  imageUrl?: string;
  family?: string;
  nftId?: string;
  ownerId?: string;
  communityId?: string;
  hasBeenMinted?: boolean;
};

export type UnmintedMetadata = {
  id: string;
  name: string;
  collection: Collection;
  metadata: string;
  createdAt: string;
  updatedAt: string;
  driveAddress: string;
  collectionIndex: number;
};

export type Collection = {
  id: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
  name?: string;
  community?: Community;
  imageUrl?: string;
  family?: string;
  hasBeenMinted?: boolean;
  isComplete: boolean;
  symbol?: string;
  description?: string;
  unmintedMetadatas: UnmintedMetadata[];
  nft: Token;
  creators: Creator[];
  isReadyToMint: boolean;
  driveAddress: string;
  uploadJob: UploadJob;
};

export type CreateCollectionResponse = BaseBlueprintResponse & {
  collection: Collection;
};

export type Creator = {
  id?: number;
  sortOrder: number;
  address: string;
  share: number;
  wallet: Wallet;
  collection: Collection;
};

export type UpdateCollectionInput = {
  id: string;
  name?: string;
  symbol?: string;
  description?: string;
  sellerFeeBasisPoints?: number;
  imageUrl?: string;
  creators?: Creator[];
  isReadyToMint?: boolean;
  uploadJobId?: string;
  driveAddress?: string;
};

export type UpdateCollectionResponse = BaseBlueprintResponse & {
  collection: Collection;
};

export type TokenMetadata = {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  animation_url?: string;
  external_url: string;
  edition?: number;
  collection?: {
    name: string;
    family?: string;
  };
  attributes: {
    trait_type: string;
    value: string;
  }[];
  properties?: {
    files: {
      uri: string;
      type: string;
      cdn?: string;
    }[];
    category: string;
    creators: {
      address: string;
      share: number;
    }[];
  };
  index?: number; // sort order in original metadata JSON file
};

export type CreateDriveInput = {
  name: string;
  sizeInKb: number;
  ownerAddress: string;
};

export type CreateDriveResponse = BaseBlueprintResponse & {
  address: string;
  transaction: string;
};

export type GetDriveInput = {
  address: string;
  ownerAddress: string;
};

export type GetDrivesInput = {
  ownerAddress: string;
};

export type DriveAccount = {
  address: string;
  name: string;
  immutable: boolean;
  toBeDeleted: boolean;
  deleteRequestEpoch: number;
  storage: string;
  owner1: string;
  accountCounterSeed: number;
  creationTime: number;
  createdAtString: string;
  creationEpoch: number;
  lastFeeEpoch: number;
};

export type Drive = {
  account: DriveAccount;
  address: string;
  name: string;
  files: string[];
  storage: {
    total: string;
    used: string;
    free: string;
    percentUsed: number;
    percentFree: number;
    bytes: {
      total: number;
      used: number;
      free: number;
    };
  };
};

export type GetDriveResponse = BaseBlueprintResponse & {
  drive: Drive;
};

export type GetDrivesResponse = BaseBlueprintResponse & {
  drives: DriveAccount[];
};

export type IncreaseStorageInput = {
  address: string;
  amountInKb: number;
  ownerAddress: string;
};

export type IncreaseStorageResponse = BaseBlueprintResponse & {
  message: string;
  transaction: string;
};

export type ReduceStorageInput = {
  address: string;
  amountInKb: number;
  ownerAddress: string;
};

export type ReduceStorageResponse = BaseBlueprintResponse & {
  message: string;
  transaction: string;
};

export type DeleteDriveInput = {
  address: string;
};

export type DeleteDriveResponse = BaseBlueprintResponse & {
  transaction: string;
};

export type CreateUploadJobInput = {
  driveAddress?: string;
  sizeInBytes?: number;
  userId: string;
  statusText?: string;
  statusId?: string;
  isComplete?: boolean;
  log?: string;
  percentComplete?: number;
};

export type CreateUploadJobResponse = BaseBlueprintResponse & {
  job: UploadJob;
};

export enum UploadJobStatus {
  IN_PROGRESS = "IN_PROGRESS",
  ERROR = "ERROR",
  COMPLETE = "COMPLETE",
}

export const StatusUUIDs = {
  [UploadJobStatus.IN_PROGRESS]: "534090fe-488a-42fc-9573-84a65ff9fc57",
  [UploadJobStatus.ERROR]: "03b962a7-2a48-4efc-9d42-9d827728ab71",
  [UploadJobStatus.COMPLETE]: "39353545-336d-4fce-a039-cc4fc203a8a9",
};

export type UploadJob = {
  createdAt: string;
  driveAddress: string;
  id: string;
  isComplete: boolean;
  log: string;
  percentComplete: number;
  sizeInBytes: number;
  updatedAt: string;
  statusText: string;
  fileCount: number;
  status: {
    id: string;
    name: string;
  };
  user: {
    id: string;
  };
};

export enum BlueprintApiActions {
  ADD_AIRDROP_RECIPIENTS = "ADD_AIRDROP_RECIPIENTS",
  CREATE_AIRDROP = "CREATE_AIRDROP",
  CREATE_COLLECTION = "CREATE_COLLECTION",
  CREATE_DRIVE = "CREATE_DRIVE",
  CREATE_DISENSER = "CREATE_DISENSER",
  CREATE_TREE = "CREATE_TREE",
  CREATE_UPLOAD_JOB = "CREATE_UPLOAD_JOB",
  DELETE_DRIVE = "DELETE_DRIVE",
  DISPENSE_TOKENS = "DISPENSE_TOKENS",
  GET_DRIVE = "GET_DRIVE",
  GET_DRIVES = "GET_DRIVES",
  INCREASE_STORAGE = "INCREASE_STORAGE",
  MINT_CNFT = "MINT_CNFT",
  MINT_NFT = "MINT_NFT",
  REDUCE_STORAGE = "REDUCE_STORAGE",
  UPDATE_COLLECTION = "UPDATE_COLLECTION",
  UPDATE_UPLOAD_JOB = "UPDATE_UPLOAD_JOB",
  UPLOAD_FILE = "UPLOAD_FILE",
  UPLOAD_FILES = "UPLOAD_FILES",
  UPLOAD_JSON = "UPLOAD_JSON",
}

export type CollectionMetadataStats = {
  totalMetadatasCount: number;
  totalMetadatasSize: number;
};

export type CollectionFileStats = {
  files: File[];
  totalUncompressedSize: number;
  fileNamesAreValid: boolean;
};

export type CollectionStatsFromCollectionMetadatas = {
  count: number;
  uniqueTraits: string[];
  creators: string[];
  validCount?: number;
};

export type UpdateUploadJobResponse = BaseBlueprintResponse & {
  job: UploadJob;
};

export type UpdateUploadJobInput = {
  id: string;
  isComplete?: boolean;
  log?: string;
  percentComplete?: number;
  sizeInBytes?: number;
  statusText?: string;
  statusId?: string;
};

export type ValidationIssue = { text: string; index: number };

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
  startTimestamp?: number;
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
  recipients?: string[];
  recipientsJsonFile?: File;
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

export enum BlueprintApiActions {
  ADD_AIRDROP_RECIPIENTS = "ADD_AIRDROP_RECIPIENTS",
  CREATE_AIRDROP = "CREATE_AIRDROP",
  CREATE_DISENSER = "CREATE_DISENSER",
  DISPENSE_TOKENS = "DISPENSE_TOKENS",
  MINT_NFT = "MINT_NFT",
  UPLOAD_FILE = "UPLOAD_FILE",
  UPLOAD_JSON = "UPLOAD_JSON",
}

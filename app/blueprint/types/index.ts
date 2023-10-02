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
  SPL,
  NFT,
  SFT,
}

export type Trait = {
  id: string;
  name: string;
  value: string;
};

export enum BlueprintApiActions {
  CREATE_DISENSER = "CREATE_DISENSER",
  DISPENSE_TOKENS = "DISPENSE_TOKENS",
}

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

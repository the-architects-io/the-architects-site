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
  };
  hashList?: string;
  childRewards?: DispenserReward[];
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
};

export type Wallet = {
  address: string;
  id: string;
};

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
  amount?: number;
  id: string;
  imageUrl?: string;
  payoutChance: number;
  isFreezeOnDelivery: boolean;
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

import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";

export type MappedRewards = {
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
};

export const mapRewards = (rewards: Dispenser["rewardCollections"]) => {
  if (!rewards) return null;

  return {
    rewards: rewards.map(
      ({
        name,
        id,
        itemCollection,
        hashListCollection,
        payoutChance,
        isFreezeOnDelivery,
      }) => {
        let hashList;
        let item;
        let token;

        if (hashListCollection?.id) {
          hashList = hashListCollection.hashList.rawHashList;
        }

        if (itemCollection?.id) {
          item = itemCollection.item;
        }

        if (item) {
          token = {
            id: item.token.id,
            mintAddress: item.token.mintAddress,
            name: item.token.name,
          };
        }

        let mappedRewards: MappedRewards = {
          name,
          amount: itemCollection?.amount || hashListCollection?.amount,
          imageUrl: item?.imageUrl || "",
          id,
          payoutChance,
          isFreezeOnDelivery,
        };

        if (hashList) {
          mappedRewards = {
            ...mappedRewards,
            hashList,
          };
        }

        if (token) {
          mappedRewards = {
            ...mappedRewards,
            token,
          };
        }

        return mappedRewards;
      }
    ),
  };
};

import { DispenserReward } from "@/app/blueprint/types";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";

const sortRewards = (rewards: DispenserReward[]) => {
  return rewards.sort((a, b) => {
    if (a.payoutChance > b.payoutChance) {
      return -1;
    }
    if (a.payoutChance < b.payoutChance) {
      return 1;
    }
    return 0;
  });
};

const mapRewardCollection = (rewards: Dispenser["rewardCollections"]) => {
  return rewards.map(
    ({
      name,
      id,
      itemCollection,
      hashListCollection,
      payoutChance,
      isFreezeOnDelivery,
      childRewardCollections,
    }) => {
      let hashList;
      let item;
      let token;
      let childRewards;

      if (hashListCollection?.id) {
        hashList = hashListCollection.hashList.rawHashList;
      }

      if (itemCollection?.id) {
        item = itemCollection.item;
      }

      if (childRewardCollections) {
        childRewards = mapRewardCollection(childRewardCollections);
      }

      if (item) {
        token = {
          id: item.token.id,
          mintAddress: item.token.mintAddress,
          name: item.token.name,
        };
      }

      let mappedReward: DispenserReward = {
        name,
        amount: itemCollection?.amount || hashListCollection?.amount,
        imageUrl: item?.imageUrl || "",
        id,
        payoutChance,
        isFreezeOnDelivery,
      };

      if (hashList) {
        mappedReward = {
          ...mappedReward,
          hashList,
        };
      }

      if (token) {
        mappedReward = {
          ...mappedReward,
          token,
        };
      }

      if (!!childRewards && childRewards.length > 0) {
        mappedReward = {
          ...mappedReward,
          childRewards,
        };
      }

      return mappedReward;
    }
  );
};

export const mapRewards = (
  rewards: Dispenser["rewardCollections"]
): DispenserReward[] | null => {
  if (!rewards) return null;

  return sortRewards(mapRewardCollection(rewards));
};

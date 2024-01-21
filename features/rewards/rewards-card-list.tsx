import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { DispenserReward } from "@/app/blueprint/types";
import RewardCard from "@/features/rewards/reward-card";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export const RewardsCardList = ({
  dispenserId,
  inStockMintAddresses,
  isFetchingInStockMintAddresses,
  cardWidth,
  className,
}: {
  dispenserId: string;
  inStockMintAddresses?: string[];
  isFetchingInStockMintAddresses: boolean;
  cardWidth?: number;
  className?: string;
}) => {
  const { rewards, collectionWallet, dispenser } = useDispenser(dispenserId);
  const [parsedRewards, setParsedRewards] = useState<DispenserReward[]>([]);

  const parseRewards = useCallback(async () => {
    if (!rewards?.length) return;
    const parsedRewards = [];

    for (const reward of rewards) {
      let imageUrl;
      if (reward?.imageUrl) {
        const { data } = await axios.get(reward.imageUrl);
        if (data?.image) {
          imageUrl = data?.image;
        } else {
          imageUrl = reward.imageUrl;
        }
      }
      const parsedReward = {
        ...reward,
        imageUrl,
      };

      parsedRewards.push(parsedReward);
    }

    setParsedRewards(parsedRewards);
  }, [rewards]);

  useEffect(() => {
    if (!rewards?.length) return;

    parseRewards();
  }, [parseRewards, rewards]);

  return (
    <div className="max-w-[1024px] mx-auto">
      <div className="flex flex-wrap justify-center w-full">
        {!!parsedRewards &&
          parsedRewards
            .sort((a, b) => (a.payoutSortOrder || 0) - (b.payoutSortOrder || 0))
            .map((reward) => (
              <RewardCard
                cardWidth={cardWidth}
                key={reward.id}
                reward={reward}
                isFetchingInStockMintAddresses={isFetchingInStockMintAddresses}
                inStockMintAddresses={inStockMintAddresses}
              />
            ))}
      </div>
    </div>
  );
};

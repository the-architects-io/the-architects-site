import { RewardDisplayType, RewardDisplayTypes } from "@/app/blueprint/types";
import { RewardsCardList } from "@/features/rewards/rewards-card-list";
import { RewardsList } from "@/features/rewards/rewards-list";
import classNames from "classnames";

export const RewardsUI = ({
  dispenserId,
  inStockMintAddresses,
  rewardDisplayType = RewardDisplayTypes.LIST,
  className,
}: {
  dispenserId: string;
  inStockMintAddresses?: string[];
  rewardDisplayType?: RewardDisplayTypes;
  className?: string;
}) => {
  return (
    <div className="my-8 w-full max-w-[1024px] mx-auto">
      {rewardDisplayType === RewardDisplayTypes.LIST && (
        <RewardsList
          className={classNames(["mb-4 max-w-md mx-auto", className])}
          inStockMintAddresses={inStockMintAddresses}
          dispenserId={dispenserId}
        />
      )}
      {rewardDisplayType === RewardDisplayTypes.CARDS && (
        <RewardsCardList
          dispenserId={dispenserId}
          inStockMintAddresses={inStockMintAddresses}
        />
      )}
    </div>
  );
};

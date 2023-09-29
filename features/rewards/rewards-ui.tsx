import { RewardDisplayType, RewardDisplayTypes } from "@/app/blueprint/types";
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
    <>
      {rewardDisplayType === RewardDisplayTypes.LIST && (
        <RewardsList
          className={classNames(["mb-4 max-w-md", className])}
          inStockMintAddresses={inStockMintAddresses}
          dispenserId={dispenserId}
        />
      )}
      {rewardDisplayType === RewardDisplayTypes.CARDS && <>Cards</>}
    </>
  );
};

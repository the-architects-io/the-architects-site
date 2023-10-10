import { RewardDisplayTypes } from "@/app/blueprint/types";
import Spinner from "@/features/UI/spinner";
import { RewardsCardList } from "@/features/rewards/rewards-card-list";
import { RewardsList } from "@/features/rewards/rewards-list";
import classNames from "classnames";

export const RewardsUI = ({
  dispenserId,
  inStockMintAddresses,
  isFetchingInStockMintAddresses,
  rewardDisplayType = RewardDisplayTypes.LIST,
  cardWidth,
  className,
}: {
  dispenserId: string;
  inStockMintAddresses?: string[];
  isFetchingInStockMintAddresses: boolean;
  rewardDisplayType?: RewardDisplayTypes;
  cardWidth?: number;
  className?: string;
}) => {
  if (isFetchingInStockMintAddresses) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="my-8 w-full max-w-[1024px] mx-auto">
      {rewardDisplayType === RewardDisplayTypes.LIST && (
        <RewardsList
          className={classNames(["mb-4 max-w-md mx-auto", className])}
          inStockMintAddresses={inStockMintAddresses}
          dispenserId={dispenserId}
          isFetchingInStockMintAddresses={isFetchingInStockMintAddresses}
        />
      )}
      {rewardDisplayType === RewardDisplayTypes.CARDS && (
        <RewardsCardList
          cardWidth={cardWidth}
          dispenserId={dispenserId}
          inStockMintAddresses={inStockMintAddresses}
          isFetchingInStockMintAddresses={isFetchingInStockMintAddresses}
        />
      )}
    </div>
  );
};

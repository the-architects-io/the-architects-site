import { DispenserReward, RewardPayoutOrderTypes } from "@/app/blueprint/types";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { getAbbreviatedAddress, round } from "@/utils/formatting";
import { isPublicKey } from "@metaplex-foundation/umi";
import classNames from "classnames";
import { useEffect, useState } from "react";

export default function RewardCard({
  reward,
  isFetchingInStockMintAddresses,
  inStockMintAddresses,
  className,
  cardWidth,
}: {
  reward: DispenserReward;
  isFetchingInStockMintAddresses: boolean;
  inStockMintAddresses?: string[];
  className?: string;
  cardWidth?: number;
}) {
  const [rewardPayoutOrderType, setRewardPayoutOrderType] =
    useState<RewardPayoutOrderTypes | null>(null);

  useEffect(() => {
    if (typeof reward.payoutSortOrder === "number") {
      setRewardPayoutOrderType(RewardPayoutOrderTypes.SEQUENTIAL);
    } else {
      setRewardPayoutOrderType(RewardPayoutOrderTypes.RANDOM);
    }
  }, [reward]);

  return (
    <div
      className="p-2 flex flex-col flex-1 grow-0 mx-2"
      style={{ width: `${cardWidth}px` }}
      key={reward.id}
    >
      <div
        style={{ width: `${cardWidth}px` }}
        className={classNames([
          "flex flex-col items-center flex-1 border-2 border-gray-700 rounded-lg relative",
          {
            "opacity-60 bg-red-800":
              !isFetchingInStockMintAddresses &&
              !inStockMintAddresses?.includes(reward.token?.mintAddress || ""),
          },
          className,
        ])}
      >
        <ImageWithFallback
          src={reward.imageUrl || ""}
          alt=""
          width="140"
          height="140"
          rounded={false}
          className="rounded-t-lg w-full"
        />
        {rewardPayoutOrderType === RewardPayoutOrderTypes.SEQUENTIAL &&
          typeof reward.payoutSortOrder === "number" &&
          reward.payoutSortOrder > -1 && (
            <div className="absolute -top-3 -right-3 rounded-full h-10 w-10 bg-gray-900 text-gray-200 flex items-center justify-center">
              <span className="text-xs self-start mt-2">#</span>
              <div className="text-2xl">{reward.payoutSortOrder + 1}</div>
            </div>
          )}
        <div className="p-2 mb-2">
          <div className="text-2xl text-center">
            {isPublicKey(reward.name)
              ? getAbbreviatedAddress(reward.name)
              : reward.name}
          </div>
          {!!reward.amount && reward.amount > 1 && (
            <div className="text-4xl my-2 text-center">x{reward.amount}</div>
          )}
          {rewardPayoutOrderType === RewardPayoutOrderTypes.RANDOM && (
            <div className="text-base text-center my-2">
              <div>
                {!!reward.payoutChance && round(reward.payoutChance * 100, 2)}%
                Chance
              </div>
            </div>
          )}
        </div>
        {!isFetchingInStockMintAddresses &&
          !inStockMintAddresses?.includes(reward.token?.mintAddress || "") && (
            <div className="text-red-500 text-xl mb-2">OOS</div>
          )}
      </div>
    </div>
  );
}

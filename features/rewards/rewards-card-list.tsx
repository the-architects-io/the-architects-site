import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { DispenserReward } from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { getAbbreviatedAddress, round } from "@/utils/formatting";
import { isPublicKey } from "@metaplex-foundation/umi";
import axios from "axios";
import classNames from "classnames";
import { useCallback, useEffect, useState } from "react";

const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const RewardsCardList = ({
  dispenserId,
  inStockMintAddresses,
  isFetchingInStockMintAddresses,
  className,
}: {
  dispenserId: string;
  inStockMintAddresses?: string[];
  isFetchingInStockMintAddresses: boolean;
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
      <div className="flex flex-wrap justify-center w-full px-4">
        {!!parsedRewards &&
          parsedRewards
            .sort((a, b) => (a.payoutSortOrder || 0) - (b.payoutSortOrder || 0))
            .map(
              ({
                imageUrl,
                token,
                id,
                payoutChance,
                amount,
                name,
                payoutSortOrder,
              }) => (
                <div
                  className={classNames([
                    "flex flex-col items-center flex-1 max-w-[280px] mx-4 border-2 border-gray-700 p-2 py-4 rounded-lg",
                    {
                      "w-full": parsedRewards.length === 1,
                      "w-1/2": parsedRewards.length === 2,
                      "w-1/3": parsedRewards.length === 3,
                      "w-1/4": parsedRewards.length === 4,
                      "w-1/5": parsedRewards.length === 5,
                      "w-1/6": parsedRewards.length === 6,
                      "opacity-60 bg-red-800":
                        !isFetchingInStockMintAddresses &&
                        !inStockMintAddresses?.includes(
                          token?.mintAddress || ""
                        ),
                    },
                  ])}
                  key={id}
                >
                  <div className="rounded-lg mb-4">
                    <ImageWithFallback
                      src={imageUrl || ""}
                      alt=""
                      width="140"
                      height="140"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="text-2xl text-center">
                    {isPublicKey(name) ? getAbbreviatedAddress(name) : name}
                  </div>
                  {!!amount && amount > 1 && (
                    <div className="text-4xl my-2 text-center">x{amount}</div>
                  )}
                  <div className="text-base">
                    {typeof payoutSortOrder === "number" &&
                    payoutSortOrder > -1 ? (
                      <div>Payout order: {payoutSortOrder}</div>
                    ) : (
                      <div>
                        {!!payoutChance && round(payoutChance * 100, 2)}% Chance
                      </div>
                    )}
                  </div>
                  {!isFetchingInStockMintAddresses &&
                    !inStockMintAddresses?.includes(
                      token?.mintAddress || ""
                    ) && <div className="text-red-500 text-xl mb-2">OOS</div>}
                </div>
              )
            )}
      </div>
    </div>
  );
};

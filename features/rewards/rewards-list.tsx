import { TokenBalance } from "@/app/api/get-token-balances-from-helius/route";
import { BASE_URL, REWARD_WALLET_ADDRESS } from "@/constants/constants";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { round } from "@/utils/formatting";
import axios from "axios";
import classNames from "classnames";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useState } from "react";

export const RewardsList = ({
  dispenser,
  className,
}: {
  dispenser: Dispenser;
  className?: string;
}) => {
  const [rewardCollections, setRewardCollections] = useState<
    Dispenser["rewardCollections"]
  >([]);
  const [isFetchingTokenBalances, setIsFetchingTokenBalances] =
    useState<boolean>(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  const getLootBoxTokenBalances = useCallback(async () => {
    setIsFetchingTokenBalances(true);
    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: REWARD_WALLET_ADDRESS,
      }
    );
    setTokenBalances(data);
    setIsFetchingTokenBalances(false);
  }, [setIsFetchingTokenBalances, setTokenBalances]);

  const getItemBalance = (mintAddress: string) => {
    if (!tokenBalances?.length) return 0;
    return tokenBalances.find(({ mint }) => mint === mintAddress)?.amount || 0;
  };

  useEffect(() => {
    const { rewardCollections } = dispenser;
    if (!rewardCollections) return;
    if (!tokenBalances?.length) getLootBoxTokenBalances();
    const sortedRewards = [...rewardCollections].sort((a, b) => {
      if (!a.payoutChance) return 1;
      if (!b.payoutChance) return -1;
      return b.payoutChance - a.payoutChance;
    });
    setRewardCollections(sortedRewards);
  }, [getLootBoxTokenBalances, dispenser, tokenBalances?.length]);

  return (
    <div className={classNames([className, "w-full"])}>
      <div className="flex w-full flex-1 justify-between rounded-lg p-2 my-2 text-lg uppercase">
        <div>Reward</div>
        <div>Chance</div>
      </div>
      {!!rewardCollections &&
        rewardCollections.map(
          (
            {
              isFreezeOnDelivery,
              itemCollection,
              hashListCollection,
              childRewardCollections,
              payoutChance,
              name: parentName,
            },
            i
          ) => (
            <Fragment key={itemCollection?.id}>
              <div className="flex flex-wrap w-full flex-1 justify-between rounded-lg p-2">
                {/* Top level name */}
                {!!itemCollection?.name && (
                  <>
                    <div className="font-bold">{itemCollection?.name}</div>
                    <div>{!!payoutChance && round(payoutChance * 100, 2)}%</div>
                  </>
                )}
                {!!hashListCollection?.id && (
                  <>
                    <div>{hashListCollection?.name}</div>
                    <div>{!!payoutChance && round(payoutChance * 100, 2)}%</div>
                  </>
                )}
                {!!parentName &&
                  !itemCollection?.name &&
                  !!itemCollection?.item?.token?.mintAddress && (
                    <>
                      <div className="w-full flex justify-between lg:w-2/5 font-bold mb-2">
                        <div className="flex flex-col">
                          <div className="mb-2 flex">
                            {parentName}{" "}
                            {isFreezeOnDelivery && (
                              <Image
                                className="bg-sky-300 rounded-lg ml-4"
                                src="/images/ice.png"
                                width={24}
                                height={20}
                                alt="ice"
                              />
                            )}
                          </div>
                          <div>
                            Stock:{" "}
                            {getItemBalance(
                              itemCollection.item.token.mintAddress
                            )}
                          </div>
                        </div>
                        <div className="lg:hidden">
                          {!!payoutChance && round(payoutChance * 100, 2)}%
                        </div>
                      </div>
                      <div className="flex flex-col justify-end w-full lg:w-2/5 flex-wrap">
                        {!!childRewardCollections &&
                          childRewardCollections.map(
                            ({ itemCollection, hashListCollection }) => (
                              <>
                                {!!itemCollection?.id && (
                                  <div
                                    key={itemCollection?.id}
                                    className="mb-2 rounded-lg lg:text-right"
                                  >
                                    {!!getItemBalance(
                                      itemCollection.item.token.mintAddress
                                    ) && (
                                      <div>
                                        {itemCollection?.name.replace("1", "")}
                                        <div className="text-sky-500">
                                          {getItemBalance(
                                            itemCollection.item.token
                                              .mintAddress
                                          )}
                                          x Remaining
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {!!hashListCollection?.id && (
                                  <div
                                    key={hashListCollection?.id}
                                    className="mb-2 rounded-lg"
                                  >
                                    <div>{hashListCollection?.name}</div>
                                  </div>
                                )}
                              </>
                            )
                          )}
                      </div>
                      <div className="w-full hidden lg:w-1/5 lg:flex justify-end order-1">
                        {!!payoutChance && round(payoutChance * 100, 2)}%
                      </div>
                    </>
                  )}
              </div>
            </Fragment>
          )
        )}
    </div>
  );
};

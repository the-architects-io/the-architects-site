import { TokenBalance } from "@/app/api/get-token-balances-from-helius/route";
import { BASE_URL, REWARD_WALLET_ADDRESS } from "@/constants/constants";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { round } from "@/utils/formatting";
import axios from "axios";
import classNames from "classnames";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useState } from "react";

export const RewardsList = ({
  dispenserId,
  className,
}: {
  dispenserId: string;
  className?: string;
}) => {
  const { rewards, collectionWallet } = useDispenser(dispenserId);

  const [isFetchingTokenBalances, setIsFetchingTokenBalances] =
    useState<boolean>(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  const getLootBoxTokenBalances = useCallback(async () => {
    if (!collectionWallet?.address) return;

    setIsFetchingTokenBalances(true);
    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: collectionWallet?.address,
      }
    );
    setTokenBalances(data);
    setIsFetchingTokenBalances(false);
  }, [collectionWallet?.address]);

  const getItemBalance = (mintAddress: string) => {
    if (!tokenBalances?.length) return 0;
    return tokenBalances.find(({ mint }) => mint === mintAddress)?.amount || 0;
  };

  useEffect(() => {
    if (!rewards) return;
    if (!tokenBalances?.length) getLootBoxTokenBalances();
  }, [getLootBoxTokenBalances, rewards, tokenBalances?.length]);

  return (
    <div className={classNames([className, "w-full"])}>
      <div className="flex w-full flex-1 justify-between rounded-lg p-2 my-2 text-lg uppercase">
        <div>Reward</div>
        <div>Chance</div>
      </div>
      {!!rewards &&
        rewards.map(
          ({
            isFreezeOnDelivery,
            token,
            id,
            childRewards,
            payoutChance,
            name,
          }) => (
            <Fragment key={id}>
              <div className="flex flex-wrap w-full flex-1 justify-between rounded-lg p-2">
                {!!name && (
                  <>
                    <div className="w-full flex justify-between lg:w-2/5 font-bold mb-2">
                      <div className="flex flex-col">
                        <div className="mb-2 flex">
                          {name}{" "}
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
                        {!!token?.mintAddress && (
                          <div>Stock: {getItemBalance(token.mintAddress)}</div>
                        )}
                      </div>
                      <div className="lg:hidden">
                        {!!payoutChance && round(payoutChance * 100, 2)}%
                      </div>
                    </div>
                    <div className="flex flex-col justify-end w-full lg:w-2/5 flex-wrap">
                      {!!childRewards &&
                        childRewards.map(({ id, token }) => (
                          <>
                            {!!id && (
                              <div
                                key={id}
                                className="mb-2 rounded-lg lg:text-right"
                              >
                                {!!token?.mintAddress && (
                                  <div>
                                    {name.replace("1", "")}
                                    <div className="text-sky-500">
                                      {getItemBalance(token.mintAddress)}x
                                      Remaining
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ))}
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

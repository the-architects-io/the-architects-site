import { BASE_URL } from "@/constants/constants";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { getAbbreviatedAddress, round } from "@/utils/formatting";
import axios from "axios";
import classNames from "classnames";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useState } from "react";

import { fromBaseUnit } from "@/utils/currency";
import { HeliusToken } from "@/app/blueprint/types";
import Spinner from "@/features/UI/spinner";
import { isPublicKey, publicKey } from "@metaplex-foundation/umi";

export const RewardsList = ({
  dispenserId,
  inStockMintAddresses,
  isFetchingInStockMintAddresses,
  className,
}: {
  dispenserId?: string;
  inStockMintAddresses?: string[];
  isFetchingInStockMintAddresses: boolean;
  className?: string;
}) => {
  const { rewards, collectionWallet, dispenser } = useDispenser(dispenserId);

  const [isFetchingTokenBalances, setIsFetchingTokenBalances] =
    useState<boolean>(false);
  const [tokenBalances, setTokenBalances] = useState<HeliusToken[]>([]);

  const getDispenserTokenBalances = useCallback(async () => {
    if (!collectionWallet?.address) return;

    setIsFetchingTokenBalances(true);
    const { data } = await axios.post(
      `${BASE_URL}/api/get-token-balances-from-helius`,
      {
        walletAddress: dispenser.rewardWalletAddress,
      }
    );
    setTokenBalances(data);
    setIsFetchingTokenBalances(false);
  }, [collectionWallet?.address, dispenser.rewardWalletAddress]);

  const getItemBalance = (token: {
    id: string;
    mintAddress: string;
    name: string;
    decimals: number;
  }) => {
    if (!tokenBalances?.length) return 0;
    let balance =
      tokenBalances.find(({ mint }) => mint === token.mintAddress)?.amount || 0;

    return fromBaseUnit(balance, token.decimals);
  };

  useEffect(() => {
    if (!rewards) return;
    if (!tokenBalances?.length) getDispenserTokenBalances();
  }, [getDispenserTokenBalances, rewards, tokenBalances?.length]);

  return (
    <div className={classNames([className, "w-full"])}>
      <div className="flex w-full flex-1 justify-between rounded-lg p-2 my-2 text-lg uppercase">
        <div className="w-3/5">Reward</div>
        <div className="w-1/5 text-left">AMT</div>
        <div className="w-1/5 text-right">
          {
            // if any rewards have a payoutSortOrder, show that column
            rewards?.some(
              (reward) =>
                typeof reward.payoutSortOrder === "number" &&
                reward?.payoutSortOrder > -1
            )
              ? "Order"
              : "Chance"
          }
        </div>
      </div>
      <div className="flex flex-wrap">
        {!!rewards &&
          rewards
            .sort((a, b) => (a.payoutSortOrder || 0) - (b.payoutSortOrder || 0))
            .map(
              ({
                isFreezeOnDelivery,
                token,
                id,
                payoutChance,
                amount,
                name,
                payoutSortOrder,
              }) => (
                <Fragment key={id}>
                  <div className="flex w-full justify-between rounded-lg p-2">
                    {!!name && (
                      <>
                        <div className="flex justify-between w-2/5 font-bold mb-2">
                          <div className="flex flex-col w-full">
                            <div className="mb-2 flex w-full overflow-hidden">
                              <div
                                className={classNames([
                                  "truncate",
                                  !isFetchingInStockMintAddresses &&
                                    !inStockMintAddresses?.includes(
                                      token?.mintAddress || ""
                                    ) &&
                                    "text-red-500 line-through",
                                ])}
                              >
                                {isPublicKey(name)
                                  ? getAbbreviatedAddress(name)
                                  : name}
                              </div>
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
                            {!isFetchingTokenBalances && (
                              <>
                                {!!token?.mintAddress &&
                                  token?.decimals > 0 &&
                                  inStockMintAddresses?.includes(
                                    token?.mintAddress || ""
                                  ) && (
                                    <div className="flex">
                                      <div className="mr-2">Stock: </div>
                                      {isFetchingTokenBalances ? (
                                        <Spinner />
                                      ) : (
                                        getItemBalance(token)
                                      )}
                                    </div>
                                  )}
                                {!isFetchingInStockMintAddresses &&
                                  !inStockMintAddresses?.includes(
                                    token?.mintAddress || ""
                                  ) && (
                                    <div className="text-red-500 text-sm mb-2">
                                      OOS
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        </div>
                        {/* <div className="flex flex-col justify-end w-full w-2/5 flex-wrap">
                        {!!childRewards &&
                          childRewards.map(({ id, token }) => (
                            <>
                              {!!id && (
                                <div
                                  key={id}
                                  className="mb-2 rounded-lg text-right"
                                >
                                  {!!token?.mintAddress && (
                                    <div>
                                      {name.replace("1", "")}
                                      <div className="text-sky-500">
                                        {getItemBalance(token)}x Remaining
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          ))}
                      </div> */}
                        <div className="w-1/5 flex justify-end order-1 text-right">
                          <div>{amount}</div>
                        </div>
                        <div className="w-1/5 flex justify-end order-1">
                          {typeof payoutSortOrder === "number" &&
                          payoutSortOrder > -1 ? (
                            <div>{payoutSortOrder}</div>
                          ) : (
                            <div>
                              {!!payoutChance && round(payoutChance * 100, 2)}%
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Fragment>
              )
            )}
      </div>
    </div>
  );
};

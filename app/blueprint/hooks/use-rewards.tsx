import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import { DispenserReward } from "@/app/blueprint/types";
import fetchTokenBalances from "@/app/blueprint/utils/fetch-token-balances";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

const useRewards = (rewards: DispenserReward[] | null) => {
  const { collectionWallet } = useDispenser(rewards?.[0]?.dispenserId);
  const [rewardsWithBalances, setRewardsWithBalances] = useState<
    DispenserReward[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBeenFetched, setHasBeenFetched] = useState(false);

  const getRewardsWithBalances = useCallback(
    async (mintAddresses: string[], walletAddress: PublicKey | string) => {
      if (!rewards?.length) return;
      setIsLoading(true);
      const balances = await fetchTokenBalances(mintAddresses, walletAddress);
      let rewardsWithBalances: DispenserReward[] = [];

      if (typeof balances?.[0]?.amount !== "number") {
        console.error(balances);
        setRewardsWithBalances([]);
        setHasBeenFetched(true);
        setIsLoading(false);
        return;
      }

      for (const reward of rewards) {
        const balance =
          balances?.[mintAddresses.indexOf(reward.token?.mintAddress || "")];
        rewardsWithBalances.push({ ...reward, balance: balance.amount });
      }

      setRewardsWithBalances(rewardsWithBalances);
      setHasBeenFetched(true);
      setIsLoading(false);
    },
    [setIsLoading, setHasBeenFetched, setRewardsWithBalances, rewards]
  );

  useEffect(() => {
    if (hasBeenFetched || !rewards?.length) return;
    const walletAddress = collectionWallet?.address;
    const mintAddresses: string[] = rewards
      .map(({ token }) => token?.mintAddress || "")
      .filter((address) => !!address.length);

    if (!walletAddress || !mintAddresses?.length) return;
    getRewardsWithBalances(mintAddresses, walletAddress);
  }, [
    collectionWallet?.address,
    getRewardsWithBalances,
    hasBeenFetched,
    rewards,
  ]);

  const returnObject = {
    rewardsWithBalances,
    isLoading,
  };

  return returnObject;
};

export default useRewards;

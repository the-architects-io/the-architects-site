import fetchTokenBalance from "@/app/blueprint/utils/fetch-token-balance";
import { BASE_URL } from "@/constants/constants";
import { DispenserCost } from "@/utils/mappers/cost";
import { PublicKey } from "@solana/web3.js";
import axios from "axios";
import { useEffect, useState } from "react";
import { ErrorResponse } from "@/app/blueprint/types";

const useCostBalance = (
  cost: DispenserCost | null,
  walletAddress: PublicKey | string | null
) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBeenFetched, setHasBeenFetched] = useState(false);

  const getCostBalance = async (
    mintAddress: string,
    walletAddress: PublicKey | string
  ) => {
    setIsLoading(true);
    const balance = await fetchTokenBalance(mintAddress, walletAddress);
    if (typeof balance === "number") {
      setBalance(balance);
    } else {
      console.error(balance);
    }
    setHasBeenFetched(true);
    setIsLoading(false);
  };

  useEffect(() => {
    if (hasBeenFetched) return;
    if (!walletAddress || !cost?.token) return;
    const mintAddress = cost?.token?.mintAddress;
    getCostBalance(mintAddress, walletAddress);
  }, [cost?.token, hasBeenFetched, walletAddress]);

  return {
    balance,
    isLoading,
  };
};

export default useCostBalance;

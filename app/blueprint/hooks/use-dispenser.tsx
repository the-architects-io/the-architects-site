"use client";

import {
  Dispenser,
  DispenserCost,
  DispenserGate,
  DispenserRestriction,
  DispenserReward,
} from "@/app/blueprint/types";
import { Payout } from "@/app/profile/[id]/page";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { mapCosts } from "@/app/blueprint/utils/mappers/cost";
import { mapGates } from "@/app/blueprint/utils/mappers/gates";
import { mapRestrictions } from "@/app/blueprint/utils/mappers/restrictions";
import { mapRewards } from "@/app/blueprint/utils/mappers/rewards";
import { useQuery } from "@apollo/client";
import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "@/constants/constants";

export type ClaimRewardResponse = {
  txAddress?: string;
  payout?: Payout;
  message?: string;
  success: boolean;
};

export type ClaimRewardOptions = {
  burnTxAddress?: string;
  mintAddresses?: string[];
};

const useDispenser = (dispenserId?: string) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const [costs, setCosts] = useState<DispenserCost[] | null>(null);
  const [rewards, setRewards] = useState<DispenserReward[] | null>(null);
  const [gates, setGates] = useState<DispenserGate[] | null>(null);
  const [restrictions, setRestrictions] = useState<
    DispenserRestriction[] | null
  >(null);

  const { loading, error, refetch } = useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: dispenserId },
    skip: !dispenserId,
    fetchPolicy: "network-only",
    onCompleted: ({
      dispensers_by_pk: dispenser,
    }: {
      dispensers_by_pk: Dispenser;
    }) => {
      if (!dispenser) return;
      setDispenser(dispenser);
      setCosts(mapCosts(dispenser.costCollections));
      setRewards(mapRewards(dispenser.rewardCollections));
      setGates(mapGates(dispenser.gateCollections));
      setRestrictions(mapRestrictions(dispenser.restrictionCollections));
    },
  });

  const claimReward = async (
    address: string,
    options?: ClaimRewardOptions
  ): Promise<ClaimRewardResponse> => {
    return new Promise(async (resolve, reject) => {
      // TODO: Add burnTxAddress to the request for gated dispensers
      try {
        setIsClaiming(true);

        const { data } = await axios.post("/api/claim-dispenser", {
          address,
          dispenserId,
          mintAddresses: options?.mintAddresses,
        });
        resolve({
          txAddress: data?.rewardTxAddress,
          payout: data?.payout,
          success: true,
        });
      } catch (error: any) {
        return reject({
          success: false,
          message: error?.response?.data?.message,
        });
      } finally {
        setIsClaiming(false);
      }
    });
  };

  if (!dispenser)
    return {
      isLoading: false,
      dispenser: {
        id: null,
        name: null,
        description: null,
        imageUrl: null,
        isEnabled: false,
        collectionWallet: null,
        rewardWalletAddress: null,
        rewardCollections: [],
        cooldownInMs: null,
      },
      costs: null,
      rewards: null,
      gates: null,
      restrictions: null,
      claimReward: () => Promise.reject("No dispenser"),
      fetchRewardTokenBalances: () => Promise.reject("No dispenser"),
    };

  const { imageUrl, description, id, isEnabled, name, collectionWallet } =
    dispenser;

  return {
    dispenser,
    collectionWallet,
    imageUrl,
    description,
    name,
    id,
    isEnabled,
    isLoading: loading,
    refetch,
    error,
    costs,
    rewards,
    gates,
    restrictions,
    claimReward,
    isClaiming,
    fetchRewardTokenBalances: async () => {
      if (!collectionWallet?.address) return;

      const { data } = await axios.post(
        `${BASE_URL}/api/get-token-balances-from-helius`,
        {
          walletAddress: dispenser.rewardWalletAddress,
        }
      );

      return data;
    },
  };
};

export default useDispenser;

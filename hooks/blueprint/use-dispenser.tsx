"use client";

import { Payout } from "@/app/profile/[id]/page";
import { BASE_URL } from "@/constants/constants";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { DispenserCost, mapCost } from "@/utils/mappers/cost";
import { DispenserGate, mapGates } from "@/utils/mappers/gates";
import {
  DispenserRestriction,
  mapRestrictions,
} from "@/utils/mappers/restrictions";
import { DispenserReward, mapRewards } from "@/utils/mappers/rewards";
import { useQuery } from "@apollo/client";
import axios from "axios";
import { useState } from "react";

export type ClaimRewardResponse = {
  rewardTxAddress?: string;
  payout?: Payout;
  message?: string;
  success: boolean;
};

const useDispenser = (dispenserId?: string) => {
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const [cost, setCost] = useState<DispenserCost | null>(null);
  const [rewards, setRewards] = useState<DispenserReward[] | null>(null);
  const [gates, setGates] = useState<DispenserGate[] | null>(null);
  const [restrictions, setRestrictions] = useState<
    DispenserRestriction[] | null
  >(null);

  const { loading } = useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: dispenserId },
    skip: !dispenserId,
    // fetchPolicy: "network-only",
    onCompleted: ({
      dispensers_by_pk: dispenser,
    }: {
      dispensers_by_pk: Dispenser;
    }) => {
      if (!dispenser) return;
      setDispenser(dispenser);
      setCost(mapCost(dispenser.costCollections?.[0]));
      setRewards(mapRewards(dispenser.rewardCollections));
      setGates(mapGates(dispenser.gateCollections));
      setRestrictions(mapRestrictions(dispenser.restrictionCollections));
    },
  });

  const claimReward = async (address: string): Promise<ClaimRewardResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.post("/api/claim-dispenser", {
          address,
          dispenserId,
        });
        resolve({
          rewardTxAddress: data?.rewardTxAddress,
          payout: data?.payout,
          success: true,
        });
      } catch (error: any) {
        return reject({
          success: false,
          message: error?.response?.data?.message,
        });
      }
    });
  };

  const getCostBalance = async (
    cost: DispenserCost,
    walletAddress: string
  ): Promise<number> => {
    debugger;
    if (!cost) return Promise.reject("No cost");
    const mintAddress = cost.token.mintAddress;

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.post(
          `${BASE_URL}/api/get-token-balances-from-helius`,
          {
            walletAddress,
            mintAddresses: [mintAddress],
          }
        );
        resolve(data?.[0]?.amount || 0);
      } catch (error: any) {
        return reject({
          success: false,
          message: error?.response?.data?.message,
        });
      }
    });
  };

  return {
    dispenser,
    isLoading: loading,
    cost,
    rewards,
    gates,
    restrictions,
    claimReward,
    getCostBalance,
  };
};

export default useDispenser;

"use client";

import {
  DispenserCost,
  DispenserGate,
  DispenserRestriction,
  DispenserReward,
} from "@/app/blueprint/types";
import { Payout } from "@/app/profile/[id]/page";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { mapCost } from "@/app/blueprint/utils/mappers/cost";
import { mapGates } from "@/app/blueprint/utils/mappers/gates";
import { mapRestrictions } from "@/app/blueprint/utils/mappers/restrictions";
import { mapRewards } from "@/app/blueprint/utils/mappers/rewards";
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

  if (!dispenser)
    return {
      isLoading: false,
      dispenser: null,
      cost: null,
      rewards: null,
      gates: null,
      restrictions: null,
      claimReward: () => Promise.reject("No dispenser"),
    };

  const { imageUrl, description, id, isEnabled, name } = dispenser;

  return {
    dispenser,
    imageUrl,
    description,
    name,
    id,
    isEnabled,
    isLoading: loading,
    cost,
    rewards,
    gates,
    restrictions,
    claimReward,
  };
};

export default useDispenser;

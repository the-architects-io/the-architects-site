"use client";

import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { mapCost } from "@/utils/mappers/cost";
import { useQuery } from "@apollo/client";
import { useState } from "react";

type MappedCosts = any;
type MappedRewards = any;
type MappedGates = any;
type MappedRestrictions = any;

const useDispenser = (dispenserId: string) => {
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const [cost, setCost] = useState<MappedCosts | null>(null);
  const [rewards, setRewards] = useState<MappedRewards | null>(null);
  const [gates, setGates] = useState<MappedGates | null>(null);
  const [restrictions, setRestrictions] = useState<MappedRestrictions | null>(
    null
  );

  const { loading } = useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: dispenserId },
    fetchPolicy: "network-only",
    onCompleted: ({
      dispensers_by_pk: dispenser,
    }: {
      dispensers_by_pk: Dispenser;
    }) => {
      if (!dispenser) return;
      setDispenser(dispenser);
      setCost(mapCost(dispenser.costCollections?.[0]));
      setRewards(dispenser.rewardCollections);
      setGates(dispenser.gateCollections);
      setRestrictions(dispenser.restrictionCollections);
    },
  });

  return { dispenser, isLoading: loading, cost, rewards, gates, restrictions };
};

export default useDispenser;

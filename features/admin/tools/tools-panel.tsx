"use client";

import { useState } from "react";
import { CreateSystemTree } from "@/features/merkle-trees/create-system-merkle-tree";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { MerkleTreesTable } from "@/features/merkle-trees/merkle-trees-table";
import { useQuery } from "@apollo/client";
import {
  GET_MERKLE_TREES_BY_USER_ID,
  GET_PREMINT_TOKENS_BY_USER_ID,
} from "@the-architects/blueprint-graphql";
import { SYSTEM_USER_ID } from "@/constants/constants";
import { MintCnftBasic } from "@/features/cnfts/mint-cnft-basic";
import { MintCnftAdvanced } from "@/features/cnfts/mint-cnft-advanced";
import { PremintTokensTable } from "@/features/admin/premint-tokens/premint-tokens-table";
import { useUserData } from "@nhost/nextjs";

const tabs: ITab[] = [
  {
    name: "Merkle Trees",
    value: "merkle-trees",
  },
  {
    name: "Mint CNFT",
    value: "cnfts",
  },
  {
    name: "Mint CNFT Advanced",
    value: "cnfts-advanced",
  },
  {
    name: "Premint Tokens",
    value: "premint-tokens",
  },
];

export const AdminToolsPanel = () => {
  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);
  const user = useUserData();

  const { data, refetch } = useQuery(GET_MERKLE_TREES_BY_USER_ID, {
    variables: {
      userId: SYSTEM_USER_ID,
    },
    fetchPolicy: "no-cache",
  });

  const { data: tokenData } = useQuery(GET_PREMINT_TOKENS_BY_USER_ID, {
    variables: {
      userId: user?.id,
    },
    fetchPolicy: "no-cache",
  });

  return (
    <div className="flex flex-col items-center justify-center text-stone-300 w-full">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        handleSetTab={(tab) => setActiveTab(tab)}
      />
      {!!activeTab && activeTab.value === "merkle-trees" && (
        <div className="pt-8 w-full">
          <div className="mx-auto max-w-md mb-4">
            <CreateSystemTree refetch={refetch} />
          </div>
          {!!data?.merkleTrees?.length && (
            <MerkleTreesTable trees={data.merkleTrees} />
          )}
        </div>
      )}
      {!!activeTab && activeTab.value === "cnfts" && (
        <div className="pt-8 w-full mx-auto max-w-md">
          <MintCnftBasic />
        </div>
      )}
      {!!activeTab && activeTab.value === "cnfts-advanced" && (
        <div className="pt-8 w-full mx-auto">
          <MintCnftAdvanced />
        </div>
      )}
      {!!activeTab && activeTab.value === "premint-tokens" && (
        <div className="pt-8 w-full mx-auto">
          {!!tokenData?.tokens?.length && (
            <PremintTokensTable tokens={tokenData.tokens} />
          )}
        </div>
      )}
    </div>
  );
};

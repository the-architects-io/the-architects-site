"use client";

import { useState } from "react";
import { CreateSystemTree } from "@/features/merkle-trees/create-system-merkle-tree";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { MerkleTreesTable } from "@/features/merkle-trees/merkle-trees-table";
import { useQuery } from "@apollo/client";
import { GET_MERKLE_TREES_BY_USER_ID } from "@/graphql/queries/get-merkle-trees-by-user-id";
import { SYSTEM_USER_ID } from "@/constants/constants";

const tabs: ITab[] = [
  {
    name: "Merkle Trees",
    value: "merkle-trees",
  },
];

export const AdminToolsPanel = () => {
  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);

  const { data, refetch } = useQuery(GET_MERKLE_TREES_BY_USER_ID, {
    variables: {
      userId: SYSTEM_USER_ID,
    },
  });

  return (
    <div className="flex flex-col items-center justify-center text-stone-300 w-full">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        handleSetTab={(tab) => setActiveTab(tab)}
      />
      <div className="pt-8 w-full">
        {!!activeTab && activeTab.value === "merkle-trees" && (
          <>
            <div className="mx-auto max-w-md mb-4">
              <CreateSystemTree refetch={refetch} />
            </div>
            {!!data?.merkleTrees?.length && (
              <MerkleTreesTable trees={data.merkleTrees} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

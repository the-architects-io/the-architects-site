"use client";

import { Panel } from "@/features/UI/panel";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { useCallback, useState } from "react";
import { createBlueprintClient } from "@/app/blueprint/client";
import { CreateSystemTree } from "@/features/admin/tools/tokens/create-system-tree";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { ContentWrapper } from "@/features/UI/content-wrapper";

export const AdminToolsPanel = () => {
  const [isLoading, setIsLoading] = useState(false);

  const tabs: ITab[] = [
    {
      name: "Merkle Trees",
      value: "merkle-trees",
    },
  ];

  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);

  return (
    <div className="flex flex-col items-center justify-center text-stone-300">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        handleSetTab={(tab) => setActiveTab(tab)}
      />
      <div className="pt-8">
        {!!activeTab && activeTab.value === "merkle-trees" && (
          <CreateSystemTree />
        )}
      </div>
    </div>
  );
};

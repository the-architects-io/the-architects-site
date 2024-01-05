"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SharedHead from "@/features/UI/head";
import { ItemsList } from "@/features/admin/items/items-list";
import { TraitsList } from "@/features/admin/traits/traits-list";
import { CommunitiesList } from "@/features/admin/communities/communities-list";
import { NftCollectionsList } from "@/features/admin/nft-collections/nfts-collection-list";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { ToolsList } from "@/features/admin/tools/tools-list";
import { UsersList } from "@/features/admin/users/users-list";
import { DispensersList } from "@/features/admin/dispensers/dispensers-list";

const primaryTabs: ITab[] = [
  {
    name: "Items",
    value: "items",
  },
  {
    name: "Characters",
    value: "characters",
  },
  {
    name: "Users & Tools",
    value: "users-tools",
  },
];

const charactersTabs: ITab[] = [
  {
    name: "FunGuys",
    value: "funguys",
    parent: "characters",
  },
  {
    name: "FunGuys 3D",
    value: "funguys-3d",
    parent: "characters",
  },
  {
    name: "Fungies",
    value: "fungies",
    parent: "characters",
  },
];

const itemsTabs: ITab[] = [
  {
    name: "Items",
    value: "items",
    parent: "items",
  },
  {
    name: "Dispensers",
    value: "dispensers",
    parent: "items",
  },
];

const communityTabs: ITab[] = [
  {
    name: "Communities",
    value: "communities",
    parent: "users-tools",
  },
  {
    name: "Nft Collections",
    value: "nft-collections",
    parent: "users-tools",
  },
  {
    name: "Tools",
    value: "tools",
    parent: "users-tools",
  },
  {
    name: "Users",
    value: "users",
    parent: "users-tools",
  },
];

const subTabs = [...charactersTabs, ...itemsTabs, ...communityTabs];

const Admin: NextPage = () => {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(primaryTabs[0]);
  const [activeSubTab, setActiveSubTab] = useState<ITab>(itemsTabs[0]);
  const searchParams = useSearchParams();

  const showCreateLink =
    activeSubTab.value === "items" || activeSubTab.value === "dispensers";

  const updateUrl = useCallback(
    (tab: ITab) => {
      router.push(`/admin?tab=${tab.value}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSubTab]
  );

  const handleSetSubTab = useCallback(
    (tab: ITab) => {
      setActiveSubTab(tab);

      updateUrl(tab);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setActiveSubTab]
  );

  const handleSetPrimaryTab = (tab: ITab) => {
    setActiveTab(tab);
    switch (tab.value) {
      case "items":
        handleSetSubTab(itemsTabs[0]);
        break;
      case "characters":
        handleSetSubTab(charactersTabs[0]);
        break;
      case "communities":
      default:
        handleSetSubTab(communityTabs[0]);
        break;
    }
  };

  const getCreateLink = () => {
    switch (activeSubTab.value) {
      case "items":
        return "/admin/item/create";
      case "dispensers":
        return "/admin/dispenser/create";
      default:
        return "";
    }
  };

  useEffect(() => {
    const searchParam = searchParams.get("tab");
    if (searchParam) {
      const subTab = subTabs.find((tab) => tab.value === searchParam);
      const primaryTab = primaryTabs.find(
        (tab) => subTab?.parent === tab.value
      );
      if (primaryTab) setActiveTab(primaryTab);
      if (subTab) handleSetSubTab(subTab);
    }
  }, [handleSetSubTab, searchParams]);

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <SharedHead title="Admin" />
      <div className="text-3xl mb-4">Admin</div>
      <div className="px-2 lg:px-0 pb-4 w-full">
        <Tabs
          tabs={primaryTabs}
          activeTab={activeTab}
          handleSetTab={(tab) => handleSetPrimaryTab(tab)}
        />
        {activeTab.value === "characters" && (
          <Tabs
            tabs={charactersTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
        {activeTab.value === "items" && (
          <Tabs
            tabs={itemsTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
        {activeTab.value === "users-tools" && (
          <Tabs
            tabs={communityTabs}
            activeTab={activeSubTab}
            handleSetTab={(tab) => handleSetSubTab(tab)}
          />
        )}
      </div>

      {/* characters */}

      {/* Items */}
      {activeSubTab.value === "items" && <ItemsList />}
      {activeSubTab.value === "dispensers" && <DispensersList />}

      {/* Users/NFTs */}
      {activeSubTab.value === "users" && <UsersList />}
      {activeSubTab.value === "tools" && <ToolsList />}
      {activeSubTab.value === "communities" && <CommunitiesList />}
      {activeSubTab.value === "nft-communities" && <NftCollectionsList />}
      {!!showCreateLink && (
        <Link href={getCreateLink()}>
          <button className="bottom-4 right-4">
            <PlusCircleIcon className="w-12 h-12 absolute bottom-8 right-16 text-stone-300 hover:text-stone-900 hover:bg-stone-300 rounded-full bg-gray-900 shadow-deep hover:shadow-deep-float" />
          </button>
        </Link>
      )}
    </ContentWrapper>
  );
};

export default Admin;

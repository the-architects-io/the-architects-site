"use client";

import { useQuery } from "@apollo/client";
import { useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { Panel } from "@/features/UI/panel";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import {
  Dispenser,
  HashListCollection,
  ItemCollection,
} from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { Divider } from "@/features/UI/divider";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { RewardsSettingsPanel } from "@/features/admin/dispensers/rewards/rewards-settings-panel";
import { CostsSettingsPanel } from "@/features/admin/dispensers/costs/cost-settings-panel";
import { GatesSettingsPanel } from "@/features/admin/dispensers/gates/gates-settings-panel";
import { RestrictionsSettingsPanel } from "@/features/admin/dispensers/restrictions/restrictions-settings-panel";
import { ConfigSettingsPanel } from "@/features/admin/dispensers/config/config-settings-panel";
import { StatsPanel } from "@/features/admin/dispensers/stats/stats-panel";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";

export type RewardCollection = {
  id: string;
  name: string;
  payoutChance?: number;
  hashListCollection: HashListCollection;
  itemCollection: ItemCollection;
  childRewardCollections?: {
    id: string;
    name: string;
    hashListCollection: HashListCollection;
    itemCollection: ItemCollection;
  }[];
};

export default function DispenserDetailPage({ params }: { params: any }) {
  const { rewards } = useDispenser(params?.id);
  const tabs: ITab[] = [
    { name: "Rewards", value: "rewards" },
    { name: "Costs", value: "costs" },
    { name: "Gates", value: "gates" },
    { name: "Restrictions", value: "restrictions" },
    { name: "Stats", value: "stats" },
    { name: "Config", value: "config" },
  ];

  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const { isAdmin } = useAdmin();
  const [rewardCollection, setRewardCollection] =
    useState<RewardCollection | null>(null);
  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);
  const { data, loading, error, refetch } = useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: params?.id },
    skip: !params?.id,
    onCompleted: (data) => {
      const { dispensers_by_pk } = data;
      setDispenser(dispensers_by_pk);
      setHasBeenFetched(true);
    },
  });

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div className="w-full min-h-screen text-stone-300">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!dispenser && hasBeenFetched && <div>Dispenser not found</div>}
      {!!dispenser && (
        <>
          <ContentWrapper className="mb-8">
            <div className="flex w-full mb-8 px-4">
              <BackButton />
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="mb-8 p-2 bg-stone-800 rounded-2xl">
                <ImageWithFallback
                  src={dispenser.imageUrl}
                  height={120}
                  width={120}
                  className="w-36"
                  alt={dispenser.name}
                />
              </div>
              <Panel className="flex flex-col items-center justify-center max-w-2xl w-full">
                <h1 className="text-3xl mb-8 text-center">{dispenser.name}</h1>
                {!!dispenser.rarity && (
                  <div className="text-xl mb-2 flex items-center space-x-4">
                    <div>Rarity:</div>
                    <div>{dispenser.rarity.name}</div>
                  </div>
                )}
                {!!dispenser.description && (
                  <div className="italic text-lg">{dispenser.description}</div>
                )}
                <Divider />
                <div className="py-4">
                  <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    handleSetTab={(tab) => setActiveTab(tab)}
                  />
                </div>
                {!!activeTab && activeTab.value === "rewards" && (
                  <RewardsSettingsPanel
                    dispenser={dispenser}
                    refetch={refetch}
                  />
                )}
                {!!activeTab && activeTab.value === "costs" && (
                  <CostsSettingsPanel dispenser={dispenser} refetch={refetch} />
                )}
                {!!activeTab && activeTab.value === "gates" && (
                  <GatesSettingsPanel dispenser={dispenser} refetch={refetch} />
                )}
                {!!activeTab && activeTab.value === "restrictions" && (
                  <RestrictionsSettingsPanel
                    dispenser={dispenser}
                    refetch={refetch}
                  />
                )}
                {!!activeTab && activeTab.value === "stats" && (
                  <StatsPanel dispenser={dispenser} />
                )}

                {!!activeTab && activeTab.value === "config" && (
                  <ConfigSettingsPanel
                    dispenser={dispenser}
                    refetch={refetch}
                  />
                )}
              </Panel>
            </div>
          </ContentWrapper>
        </>
      )}
    </div>
  );
}

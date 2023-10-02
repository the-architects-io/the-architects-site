import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { Panel } from "@/features/UI/panel";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { RewardsSettingsPanel } from "@/features/admin/dispensers/rewards/rewards-settings-panel";
import { CostsSettingsPanel } from "@/features/admin/dispensers/costs/cost-settings-panel";
import { ConfigSettingsPanel } from "@/features/admin/dispensers/config/config-settings-panel";
import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import Spinner from "@/features/UI/spinner";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Divider } from "@mui/material";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useEffect, useState } from "react";
import { StatsPanel } from "@/features/admin/dispensers/stats/stats-panel";
import { copyTextToClipboard } from "@/utils/clipboard";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";

export const DispenserControlPanel = ({
  dispenserId,
}: {
  dispenserId: string;
}) => {
  const { description, isLoading, dispenser, rewards, refetch } =
    useDispenser(dispenserId);
  const tabs: ITab[] = [
    { name: "Rewards", value: "rewards" },
    { name: "Costs", value: "costs" },
    // { name: "Gates", value: "gates" },
    // { name: "Restrictions", value: "restrictions" },
    { name: "Stats", value: "stats" },
    { name: "Config", value: "config" },
  ];
  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);
  const [hasBeenRefetched, setHasBeenRefetched] = useState(false);

  useEffect(() => {
    if (!rewards?.length && !hasBeenRefetched && refetch) {
      refetch();
      setHasBeenRefetched(true);
    }
  }, [hasBeenRefetched, refetch, rewards?.length]);

  return (
    <>
      {!!dispenser && (
        <ContentWrapper className="mb-8">
          <div className="w-full flex flex-col items-center">
            {isLoading && <Spinner />}
            {!dispenser && !isLoading && <div>Dispenser not found</div>}
            {!!dispenser?.id && (
              <>
                <div className="mb-8 p-2 bg-stone-800 rounded-2xl">
                  <ImageWithFallback
                    src={dispenser.imageUrl}
                    height={120}
                    width={120}
                    className="w-36"
                    alt={dispenser.name}
                  />
                </div>
                <Panel className="flex flex-col items-center justify-center max-w-2xl w-full p-8">
                  <h1 className="text-3xl mb-4 text-center">
                    {dispenser.name}
                  </h1>
                  {!!dispenser.rewardWalletAddress && (
                    <div className="flex flex-col">
                      <div className="text-xl mb-8">
                        Wallet:{" "}
                        <a
                          className="text-sky-400 underline"
                          href={`https://solscan.io/account/${dispenser.rewardWalletAddress}?cluster=devnet`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {getAbbreviatedAddress(dispenser.rewardWalletAddress)}
                        </a>
                      </div>
                      {/* <PrimaryButton className="mb-4" onClick={() => {}}>
                        <Link href={`/lab/dispenser?id=${dispenser.id}`}>
                          Test
                        </Link>
                      </PrimaryButton> */}
                    </div>
                  )}
                  {!!dispenser.rarity && (
                    <div className="text-xl mb-2 flex items-center space-x-4">
                      <div>Rarity:</div>
                      <div>{dispenser.rarity.name}</div>
                    </div>
                  )}
                  {!!description && (
                    <div className="italic text-lg mb-8">{description}</div>
                  )}
                  <PrimaryButton
                    className="flex items-center justify-center mb-8"
                    onClick={() =>
                      copyTextToClipboard(
                        `https://preview.the-architects.io/in-portals/dispenser?id=${dispenser.id}`
                      )
                    }
                  >
                    <ClipboardIcon className="h-5 w-5 inline-block" />
                    <span className="mx-2">Copy Portals Interaction Link</span>
                  </PrimaryButton>
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
                      dispenserId={dispenserId}
                      dispenser={dispenser}
                      refetch={refetch || (() => {})}
                    />
                  )}
                  {!!activeTab && activeTab.value === "costs" && (
                    <CostsSettingsPanel
                      dispenser={dispenser}
                      refetch={refetch || (() => {})}
                    />
                  )}
                  {/* {!!activeTab && activeTab.value === "gates" && (
                    <GatesSettingsPanel
                      dispenser={dispenser}
                      refetch={refetch || (() => {})}
                    />
                  )}
                  {!!activeTab && activeTab.value === "restrictions" && (
                    <RestrictionsSettingsPanel
                      dispenser={dispenser}
                      refetch={refetch || (() => {})}
                    />
                  )} */}
                  {!!activeTab && activeTab.value === "stats" && (
                    <StatsPanel dispenser={dispenser} />
                  )}

                  {!!activeTab && activeTab.value === "config" && (
                    <ConfigSettingsPanel
                      dispenser={dispenser}
                      refetch={refetch || (() => {})}
                    />
                  )}
                </Panel>
              </>
            )}
          </div>
        </ContentWrapper>
      )}
    </>
  );
};

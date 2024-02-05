"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import { Airdrop, Collection, UploadJobStatus } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { AirdropListItem } from "@/features/airdrop/airdrop-list-item";
import { CollectionListItem } from "@/features/collection/collection-list-item";
import showToast from "@/features/toasts/show-toast";
import {
  GET_AIRDROPS_BY_OWNER_ID,
  GET_COLLECTIONS_BY_OWNER_ID,
} from "@the-architects/blueprint-graphql";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs: ITab[] = [
  {
    name: "Eligible to Drop",
    value: "eligible-to-drop",
  },
  {
    name: "In Setup",
    value: "in-progress",
  },
  {
    name: "Ready to Drop",
    value: "ready-to-drop",
  },
  {
    name: "Completed",
    value: "completed",
  },
];

export default function AirdropPage() {
  const router = useRouter();
  const user = useUserData();
  const { cluster } = useCluster();

  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);
  const [airdropsInProgress, setAirdropsInProgress] = useState<Airdrop[]>([]);
  const [readyToDropAirdrops, setReadyToDropAirdrops] = useState<Airdrop[]>([]);
  const [readyToMintCollections, setReadyToMintCollections] = useState<
    Collection[]
  >([]);
  const [completedAirdrops, setCompletedAirdrops] = useState<Airdrop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { loading } = useQuery(GET_COLLECTIONS_BY_OWNER_ID, {
    variables: {
      id: user?.id,
    },
    fetchPolicy: "no-cache",
    skip: !user?.id,
    onCompleted: ({ collections }: { collections: Collection[] }) => {
      console.log({ collections });
      let readyToMintCollections = collections
        .filter(
          (collection) =>
            collection.isReadyToMint ||
            collection?.uploadJob?.status?.name === UploadJobStatus.COMPLETE
        )
        .filter((collection) => !collection.hasBeenMinted);
      if (airdropsInProgress.length) {
        readyToMintCollections = readyToMintCollections
          .filter(
            (collection) =>
              !airdropsInProgress.find((airdrop) => {
                return airdrop.collection?.id === collection.id;
              })
          )
          .filter(
            (collection) =>
              !readyToDropAirdrops.find((airdrop) => {
                return (
                  airdrop.isReadyToDrop &&
                  airdrop.collection?.id === collection.id
                );
              })
          );
      }
      setReadyToMintCollections(readyToMintCollections);
      if (!loading && !isAirdropsLoading) {
        setIsLoading(false);
      }
    },
  });

  const { loading: isAirdropsLoading } = useQuery(GET_AIRDROPS_BY_OWNER_ID, {
    variables: {
      id: user?.id,
    },
    skip: !user?.id,
    fetchPolicy: "no-cache",
    onCompleted: ({ airdrops }: { airdrops: Airdrop[] }) => {
      console.log({ airdrops });
      setAirdropsInProgress(
        airdrops.filter((airdrop) => !airdrop.isReadyToDrop)
      );
      setReadyToDropAirdrops(
        airdrops.filter(
          (airdrop) =>
            airdrop.isReadyToDrop && !airdrop.collection.hasBeenMinted
        )
      );
      setReadyToMintCollections(
        readyToMintCollections.filter(
          (collection) =>
            !airdrops.find((airdrop) => {
              console.log({ airdrop, collection });
              return airdrop.collection?.id === collection.id;
            })
        )
      );
      setCompletedAirdrops(
        airdrops.filter((airdrop) => airdrop.collection.hasBeenMinted)
      );
      if (!isAirdropsLoading || !loading) {
        setIsLoading(false);
      }
    },
  });

  const handleCreateAirdrop = async (collection: Collection) => {
    if (!collection?.id || !user?.id) return;
    setIsLoading(true);
    const blueprint = createBlueprintClient({
      cluster,
    });

    const { success, airdrop } = await blueprint.airdrops.createAirdrop({
      collectionId: collection.id,
      ownerId: user?.id,
    });

    if (!success) {
      showToast({
        primaryMessage: "Error creating airdrop",
      });
      return;
    }

    router.push(`/me/airdrop/create/${airdrop.id}`);
  };

  if (isLoading) {
    return (
      <ContentWrapper>
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className="flex flex-col items-center">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          handleSetTab={(tab) => setActiveTab(tab)}
        />
        {!!activeTab && activeTab.value === "eligible-to-drop" && (
          <div className="w-full flex flex-wrap py-8">
            {!!readyToMintCollections.length ? (
              <>
                {readyToMintCollections.map((collection) => (
                  <CollectionListItem
                    shouldShowStats={false}
                    collection={collection}
                    key={collection.id}
                    onClick={() => handleCreateAirdrop(collection)}
                  >
                    <div className="w-full py-2">
                      <PrimaryButton className="w-full">
                        Create Airdrop
                      </PrimaryButton>
                    </div>
                  </CollectionListItem>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 w-full">
                <div className="mb-4">No collections found</div>
                <div className="italic text-gray-400 max-w-xs mx-auto text-center">
                  Airdrops are created from collections.{" "}
                  <Link
                    className="underline"
                    href={`${BASE_URL}/me/collection`}
                  >
                    Create a collection
                  </Link>{" "}
                  to get started.
                </div>
              </div>
            )}
          </div>
        )}
        {!!activeTab && activeTab.value === "in-progress" && (
          <div className="w-full flex flex-wrap py-8">
            {!!airdropsInProgress?.length ? (
              <>
                {airdropsInProgress.map((airdrop) => (
                  <AirdropListItem
                    airdrop={airdrop}
                    url={`${BASE_URL}/me/airdrop/create/${airdrop.id}`}
                    key={airdrop.id}
                  />
                ))}
              </>
            ) : (
              <div className="flex w-full justify-center">
                No collections in progress
              </div>
            )}
          </div>
        )}
        {!!activeTab && activeTab.value === "ready-to-drop" && (
          <div className="w-full flex flex-wrap py-8">
            {!!readyToDropAirdrops.length ? (
              <>
                {readyToDropAirdrops.map((airdrop) => (
                  <AirdropListItem
                    airdrop={airdrop}
                    url={`${BASE_URL}/me/airdrop/${airdrop.id}`}
                    key={airdrop.id}
                  />
                ))}
              </>
            ) : (
              <div className="flex w-full justify-center">
                No airdrops ready to drop
              </div>
            )}
          </div>
        )}
        {!!activeTab && activeTab.value === "completed" && (
          <div className="w-full flex flex-wrap py-8">
            {!!completedAirdrops.length ? (
              <>
                {completedAirdrops.map((airdrop) => (
                  <AirdropListItem
                    airdrop={airdrop}
                    url={``}
                    key={airdrop.id}
                  />
                ))}
              </>
            ) : (
              <div className="flex w-full justify-center">
                No airdrops completed
              </div>
            )}
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}

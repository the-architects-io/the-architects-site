"use client";
import { Collection, UploadJobStatus } from "@/app/blueprint/types";
import { CreateCollectionButton } from "@/app/blueprint/ui/create-collection-button";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { CollectionList } from "@/features/collection/collection-list";
import { CollectionListItem } from "@/features/collection/collection-list-item";
import { GET_COLLECTIONS_BY_OWNER_ID } from "@/graphql/queries/get-collections-by-owner-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tabs: ITab[] = [
  {
    name: "In Progress",
    value: "in-progress",
  },
  {
    name: "Ready to Mint",
    value: "ready-to-mint",
  },
  {
    name: "Completed",
    value: "completed",
  },
];

export default function CollectionsPage() {
  const router = useRouter();
  const user = useUserData();

  const handleRedirect = (collection: Collection | null) => {
    if (!collection?.id) return;
    router.push(`/me/collection/create/${collection.id}`);
  };

  const [collections, setCollections] = useState<Collection[]>([]);
  const [inProgressCollections, setInProgressCollections] = useState<
    Collection[] | null
  >(null);
  const [readyToMintCollections, setReadyToMintCollections] = useState<
    Collection[]
  >([]);
  const [completedCollections, setCompletedCollections] = useState<
    Collection[]
  >([]);

  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);

  const { loading } = useQuery(GET_COLLECTIONS_BY_OWNER_ID, {
    variables: {
      id: user?.id,
    },
    fetchPolicy: "no-cache",
    skip: !user?.id,
    onCompleted: ({ collections }: { collections: Collection[] }) => {
      console.log({ collections });
      setCollections(collections);
      setReadyToMintCollections(
        collections
          .filter(
            (collection) =>
              collection.isReadyToMint ||
              collection?.uploadJob?.status?.name === UploadJobStatus.COMPLETE
          )
          .filter((collection) => !collection.hasBeenMinted)
      );
      setInProgressCollections(
        collections.filter(
          (collection) =>
            !collection.isReadyToMint &&
            !collection.hasBeenMinted &&
            collection?.uploadJob?.status?.name !== UploadJobStatus.COMPLETE
        )
      );
      setCompletedCollections(
        collections.filter((collection) => collection.hasBeenMinted)
      );
    },
  });

  return (
    <ContentWrapper>
      <div className="flex flex-col items-center">
        <div className="flex w-full justify-center mb-8">
          <CreateCollectionButton
            name={`new-collection-${user?.id}`}
            onSuccess={(collection) => handleRedirect(collection)}
          />
        </div>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          handleSetTab={(tab) => setActiveTab(tab)}
        />
        {!!activeTab && activeTab.value === "in-progress" && (
          <>
            <div className="w-full flex justify-center mx-auto py-8">
              {!!inProgressCollections?.length ? (
                <>
                  {inProgressCollections.map((collection) => (
                    <CollectionListItem
                      key={collection.id}
                      shouldShowStats={true}
                      collection={collection}
                      url={
                        collection.creators?.length
                          ? `/me/collection/create/${collection.id}/upload-assets`
                          : `/me/collection/create/${collection.id}`
                      }
                    />
                  ))}
                </>
              ) : (
                <>No collections in progress</>
              )}
            </div>
          </>
        )}
        {!!activeTab && activeTab.value === "ready-to-mint" && (
          <>
            <div className="w-full flex justify-center mx-auto py-8">
              {!!readyToMintCollections?.length ? (
                <>
                  {readyToMintCollections.map((collection) => (
                    <CollectionListItem
                      key={collection.id}
                      shouldShowStats={false}
                      collection={collection}
                      url={`/me/collection/${collection.id}`}
                    >
                      <PrimaryButton onClick={() => {}} className="w-full">
                        Preview Collection
                      </PrimaryButton>
                    </CollectionListItem>
                  ))}
                </>
              ) : (
                <>No collections ready to mint</>
              )}
            </div>
          </>
        )}
        {!!activeTab && activeTab.value === "completed" && (
          <>
            <div className="w-full flex justify-center mx-auto py-8">
              {!!completedCollections?.length ? (
                <>
                  {completedCollections.map((collection) => (
                    <CollectionListItem
                      key={collection.id}
                      shouldShowStats={false}
                      collection={collection}
                      url={`/me/collection/${collection.id}`}
                    >
                      <PrimaryButton onClick={() => {}} className="w-full">
                        View Collection
                      </PrimaryButton>
                    </CollectionListItem>
                  ))}
                </>
              ) : (
                <>No collections completed</>
              )}
            </div>
          </>
        )}
      </div>
    </ContentWrapper>
  );
}

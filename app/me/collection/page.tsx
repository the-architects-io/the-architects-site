"use client";
import { Collection, UploadJobStatus } from "@/app/blueprint/types";
import { CreateCollectionButton } from "@/app/blueprint/ui/create-collection-button";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { CollectionListItem } from "@/features/collection/collection-list-item";
import { GET_COLLECTIONS_BY_OWNER_ID } from "@the-architects/blueprint-graphql";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs: ITab[] = [
  {
    name: "Ready to Mint",
    value: "ready-to-mint",
  },
  {
    name: "In Progress",
    value: "in-progress",
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

  const [isLoadingUi, setIsLoadingUi] = useState<boolean>(true);
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

  const { loading, refetch } = useQuery(GET_COLLECTIONS_BY_OWNER_ID, {
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
      setIsLoadingUi(false);
    },
  });

  const getRedirectForInProgressCollection = (collection: Collection) => {
    if (collection.creators?.length) {
      return `/me/collection/create/${collection.id}/upload-assets`;
    }

    if (
      collection.name &&
      collection.symbol &&
      collection.description &&
      collection.imageUrl
    ) {
      return `/me/collection/create/${collection.id}/select-method`;
    }

    return `/me/collection/create/${collection.id}`;
  };

  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  return (
    <ContentWrapper>
      <div className="flex flex-col items-center">
        <div className="flex w-full justify-center mb-16">
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
          <div className="w-full flex flex-wrap py-8">
            {!!inProgressCollections?.length ? (
              <>
                {inProgressCollections.map((collection) => (
                  <CollectionListItem
                    key={collection.id}
                    shouldShowStats={true}
                    collection={collection}
                    url={getRedirectForInProgressCollection(collection)}
                  />
                ))}
              </>
            ) : (
              <div className="flex justify-center w-full">
                {!!isLoadingUi ? (
                  <Spinner />
                ) : (
                  <div>No collections in progress</div>
                )}
              </div>
            )}
          </div>
        )}
        {!!activeTab && activeTab.value === "ready-to-mint" && (
          <div className="w-full flex flex-wrap py-8">
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
              <div className="flex justify-center w-full">
                {!!isLoadingUi ? (
                  <Spinner />
                ) : (
                  <div>No collections ready to mint</div>
                )}
              </div>
            )}
          </div>
        )}
        {!!activeTab && activeTab.value === "completed" && (
          <div className="w-full flex flex-wrap py-8">
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
              <div className="flex justify-center w-full">
                {!!isLoadingUi ? (
                  <Spinner />
                ) : (
                  <div>No collections completed</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}

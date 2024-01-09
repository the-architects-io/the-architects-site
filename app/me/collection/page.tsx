"use client";
import { Collection, UploadJobStatus } from "@/app/blueprint/types";
import { CreateCollectionButton } from "@/app/blueprint/ui/create-collection-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { CollectionList } from "@/features/collection/collection-list";
import { CollectionListItem } from "@/features/collection/collection-list-item";
import { GET_COLLECTIONS_BY_OWNER_ID } from "@/graphql/queries/get-collections-by-owner-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CollectionsPage() {
  const router = useRouter();
  const user = useUserData();

  const handleRedirect = (collection: Collection | null) => {
    if (!collection?.id) return;
    router.push(`/me/collection/create/${collection.id}`);
  };

  const [collections, setCollections] = useState<Collection[]>([]);
  const [inProgressCollection, setInProgressCollection] =
    useState<Collection | null>(null);
  const [readyToMintCollections, setReadyToMintCollections] = useState<
    Collection[]
  >([]);
  const [completedCollections, setCompletedCollections] = useState<
    Collection[]
  >([]);

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
      setInProgressCollection(
        collections.filter(
          (collection) =>
            !collection.isReadyToMint &&
            !collection.hasBeenMinted &&
            collection?.uploadJob?.status?.name !== UploadJobStatus.COMPLETE
        )?.[0]
      );
      setCompletedCollections(
        collections.filter((collection) => collection.hasBeenMinted)
      );
    },
  });

  return (
    <>
      <ContentWrapper>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl pb-8">My Collections</h1>
          {!!inProgressCollection ? (
            <div className="max-w-3xl mx-auto">
              <div className="text-2xl mb-4 mt-16 text-center">
                Collection in Progress
              </div>
              <CollectionListItem
                shouldShowStats={true}
                collection={inProgressCollection}
                url={
                  inProgressCollection.creators?.length
                    ? `/me/collection/create/${inProgressCollection.id}/upload-assets`
                    : `/me/collection/create/${inProgressCollection.id}`
                }
              />
            </div>
          ) : (
            <CreateCollectionButton
              name={`new-collection-${user?.id}`}
              onSuccess={(collection) => handleRedirect(collection)}
            />
          )}
          {!!readyToMintCollections.length && (
            <div className="max-w-3xl mx-auto">
              <div className="text-2xl mb-4 mt-16 text-center">
                Mint Ready Collections
              </div>
              <CollectionList
                collections={readyToMintCollections}
                linkBaseUrl="/me/collection"
              />
            </div>
          )}
          {!!completedCollections.length && (
            <div className="max-w-3xl mx-auto">
              <div className="text-2xl mb-4 mt-16 text-center">
                Already Minted Collections
              </div>
              <CollectionList
                collections={completedCollections}
                linkBaseUrl="/me/collection"
              />
            </div>
          )}
        </div>
      </ContentWrapper>
    </>
  );
}

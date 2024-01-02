"use client";
import { createBlueprintClient } from "@/app/blueprint/client";
import { Airdrop, Collection, UploadJobStatus } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { AirdropListItem } from "@/features/airdrop/airdrop-list-item";
import { CollectionListItem } from "@/features/collection/collection-list-item";
import showToast from "@/features/toasts/show-toast";
import { GET_AIRDROPS_BY_OWNER_ID } from "@/graphql/queries/get-airdrops-by-owner-id";
import { GET_COLLECTIONS_BY_OWNER_ID } from "@/graphql/queries/get-collections-by-owner-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AirdropPage() {
  const router = useRouter();
  const user = useUserData();

  const [airdropsInProgress, setAirdropsInProgress] = useState<Airdrop[]>([]);
  const [readyToDropAirdrops, setReadyToDropAirdrops] = useState<Airdrop[]>([]);
  const [readyToMintCollections, setReadyToMintCollections] = useState<
    Collection[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { loading } = useQuery(GET_COLLECTIONS_BY_OWNER_ID, {
    variables: {
      id: user?.id,
    },
    fetchPolicy: "no-cache",
    skip: !user?.id,
    onCompleted: ({ collections }: { collections: Collection[] }) => {
      console.log({ collections });
      let readyToMintCollections = collections.filter(
        (collection) =>
          collection.isReadyToMint ||
          collection?.uploadJob?.status?.name === UploadJobStatus.COMPLETE
      );
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
      if (!loading && !isAirdopsLoading) {
        setIsLoading(false);
      }
    },
  });

  const { loading: isAirdopsLoading } = useQuery(GET_AIRDROPS_BY_OWNER_ID, {
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
        airdrops.filter((airdrop) => airdrop.isReadyToDrop)
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
      if (!isAirdopsLoading || !loading) {
        setIsLoading(false);
      }
    },
  });

  const handleCreateAirdrop = async (collection: Collection) => {
    if (!collection?.id || !user?.id) return;
    setIsLoading(true);
    const blueprint = createBlueprintClient({
      cluster: "devnet",
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
    setIsLoading(false);
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
    <>
      <ContentWrapper>
        <div className="flex flex-col items-center mb-32">
          <div className="max-w-3xl mx-auto mb-4">
            <div className="text-2xl mb-4 mt-16 text-center">
              Airdrop Ready Collections
            </div>
            {!!readyToMintCollections.length ? (
              readyToMintCollections.map((collection) => (
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
              ))
            ) : (
              <>
                {!!loading ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
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
              </>
            )}
          </div>
          <div className="max-w-3xl mx-auto mb-4 items-center flex flex-col">
            <div className="text-2xl mb-4 mt-16 text-center">
              Airdrops in Progress
            </div>
            {!!airdropsInProgress.length ? (
              airdropsInProgress.map((airdrop) => (
                <AirdropListItem
                  airdrop={airdrop}
                  url={`${BASE_URL}/me/airdrop/create/${airdrop.id}`}
                  key={airdrop.id}
                />
              ))
            ) : (
              <>{isAirdopsLoading ? <Spinner /> : <>No airdrops found</>}</>
            )}
          </div>
          <div className="max-w-3xl mx-auto mb-8 items-center flex flex-col">
            <div className="text-2xl mb-4 mt-16 text-center">
              Prepared Airdrop
            </div>
            {!!readyToDropAirdrops.length ? (
              readyToDropAirdrops.map((airdrop) => (
                <AirdropListItem
                  airdrop={airdrop}
                  url={`${BASE_URL}/me/airdrop/${airdrop.id}`}
                  key={airdrop.id}
                />
              ))
            ) : (
              <>{isAirdopsLoading ? <Spinner /> : <>No airdrops found</>}</>
            )}
          </div>
        </div>
      </ContentWrapper>
    </>
  );
}

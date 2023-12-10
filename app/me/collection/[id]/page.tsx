"use client";
import { Collection } from "@/app/blueprint/types";
import { SHDW_DRIVE_BASE_URL } from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { CollectionPreview } from "@/features/collection/collection-preview";
import { DispenserControlPanel } from "@/features/dispensers/dispenser-control-panel";
import { GET_COLLECTION_BY_ID } from "@/graphql/queries/get-collection-by-id";
import { useAdmin } from "@/hooks/admin";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import Image from "next/image";
import { useState } from "react";

export default function CollectionDetailsPage({ params }: { params: any }) {
  const user = useUserData();
  const { isAdmin } = useAdmin();

  const [collection, setCollection] = useState<Collection | null>(null);

  const { loading } = useQuery(GET_COLLECTION_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    onCompleted: ({
      collections_by_pk: collection,
    }: {
      collections_by_pk: Collection;
    }) => {
      console.log({ collection });
      setCollection(collection);
    },
  });

  if (!params?.id)
    return (
      <ContentWrapper className="text-center">
        <div>Collection not found</div>
      </ContentWrapper>
    );

  if (!isAdmin && collection?.owner?.id !== user?.id) {
    return (
      <ContentWrapper className="text-center">Not authorized</ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="flex flex-col items-center w-full h-full min-h-screen text-stone-300">
      {!!collection ? (
        <>
          {!!collection?.imageUrl && (
            <Image
              src={`${collection?.imageUrl}`}
              width={340}
              height={340}
              alt="collection image"
              className="rounded-lg mb-8"
            />
          )}
          <div className="text-3xl mb-4">{collection.name}</div>
          <div className="text-xl mb-4">{collection.symbol}</div>

          <div className="text-lg mb-16">{collection.description}</div>

          {!!collection?.creators?.length && (
            <div className="text-lg mb-16 w-full max-w-lg mx-auto">
              <div className="text-2xl mb-4 text-center uppercase">
                Creators
              </div>
              <div className="w-full">
                {[...collection?.creators]
                  ?.sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((creator) => (
                    <div
                      key={creator.id}
                      className="mb-4 flex border border-gray-400 rounded-lg p-4 justify-between items-center w-full"
                    >
                      <div>{getAbbreviatedAddress(creator.wallet.address)}</div>
                      <div>{creator.share}%</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <CollectionPreview collection={collection} />
        </>
      ) : (
        <Spinner />
      )}
    </ContentWrapper>
  );
}

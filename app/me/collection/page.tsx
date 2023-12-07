"use client";
import { Collection } from "@/app/blueprint/types";
import { CreateCollectionButton } from "@/app/blueprint/ui/create-collection-button";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  SHDW_DRIVE_BASE_URL,
} from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import SharedHead from "@/features/UI/head";
import { GET_COLLECTIONS_BY_OWNER_ID } from "@/graphql/queries/get-collections-by-owner-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { Metadata } from "next";
import Head from "next/head";
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
  const [readyToMintCollections, setReadyToMintCollections] = useState<
    Collection[]
  >([]);

  const { loading } = useQuery(GET_COLLECTIONS_BY_OWNER_ID, {
    variables: {
      id: user?.id,
    },
    skip: !user?.id,
    onCompleted: ({ collections }: { collections: Collection[] }) => {
      console.log({ collections });
      setCollections(collections);
      setReadyToMintCollections(
        collections.filter((collection) => collection.isReadyToMint)
      );
    },
  });

  return (
    <>
      <ContentWrapper>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl pb-8">My Collections</h1>
          <CreateCollectionButton
            name="Test Collection"
            onSuccess={(collection) => handleRedirect(collection)}
          />
          {!!readyToMintCollections.length && (
            <>
              <div className="text-2xl mb-4 mt-8">Mint Ready Collections</div>
              <div className="flex flex-wrap">
                {readyToMintCollections.map((collection) => {
                  return (
                    <div className="m-2" key={collection.id}>
                      <Link
                        className="flex flex-col items-center space-y-4 mb-4 p-4 border border-gray-600 rounded-lg cursor-pointer"
                        href={`/me/collection/${collection.id}`}
                      >
                        <Image
                          src={`${SHDW_DRIVE_BASE_URL}/${ASSET_SHDW_DRIVE_ADDRESS}/${collection.id}-collection.png`}
                          width={200}
                          height={200}
                          alt="Collection image"
                        />
                        <div className="text-xl">{collection.name}</div>
                        <div className="text-sm">({collection.symbol})</div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </ContentWrapper>
    </>
  );
}

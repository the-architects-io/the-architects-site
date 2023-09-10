"use client";
import { Dispenser } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Card } from "@/features/UI/card";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import { GET_DISPENSERS_BY_OWNER_ID } from "@/graphql/queries/get-dispensers-by-owner-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [dispensers, setDispensers] = useState<Dispenser[] | null>(null);

  const user = useUserData();

  const { data, loading, error, refetch } = useQuery(
    GET_DISPENSERS_BY_OWNER_ID,
    {
      variables: { id: user?.id },
      skip: !user,
      onCompleted: ({ dispensers }: { dispensers: Dispenser[] }) => {
        setDispensers(dispensers);
      },
    }
  );

  return (
    <ContentWrapper>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl pb-8">My Dispensers</h1>
        <PrimaryButton className="mb-4">
          <a href="/me/dispenser/create">Create Dispenser</a>
        </PrimaryButton>
        {loading || error ? (
          <div className="py-4 flex w-full justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex w-full max-w-6xl just m-auto flex-wrap h-full text-gray-100">
              {dispensers?.length ? (
                <>
                  {dispensers?.map((dispenser) => (
                    <Link
                      href={`/me/dispenser/${dispenser.id}`}
                      key={dispenser.id}
                      className="w-full md:w-1/3 p-4 flex justify-center"
                    >
                      <Card imageUrl={dispenser.imageUrl}>
                        <div className="text-3xl tracking-widest">
                          {dispenser.name}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </>
              ) : (
                <p className="w-full text-center">
                  You don&apos;t have any dispensers yet.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </ContentWrapper>
  );
}

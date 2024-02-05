"use client";
import { Dispenser } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Card } from "@/features/UI/card";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { GET_DISPENSERS_BY_OWNER_ID } from "@the-architects/blueprint-graphql";
import { useQuery } from "@apollo/client";
import { RemoveCircleOutline } from "@mui/icons-material";
import { useUserData } from "@nhost/nextjs";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [setupDispensers, setSetupDispensers] = useState<Dispenser[]>([]);
  const [incompleteDispensers, setIncompleteDispensers] = useState<Dispenser[]>(
    []
  );

  const user = useUserData();

  const { data, loading, error, refetch } = useQuery(
    GET_DISPENSERS_BY_OWNER_ID,
    {
      variables: { id: user?.id },
      skip: !user,
      onCompleted: ({ dispensers }: { dispensers: Dispenser[] }) => {
        const brokenDispensers = dispensers.filter(
          (dispenser) => !dispenser.rewardWalletAddress
        );
        const notBrokenDispensers = dispensers.filter(
          (dispenser) => dispenser.rewardWalletAddress
        );
        const setupDispensers = notBrokenDispensers.filter(
          (dispenser) => dispenser.rewardCollections.length
        );
        const incompleteDispensers = notBrokenDispensers.filter(
          (dispenser) => !dispenser.rewardCollections.length
        );
        setSetupDispensers(setupDispensers);
        setIncompleteDispensers(incompleteDispensers);
      },
    }
  );

  if (!user?.id) {
    return (
      <ContentWrapper className="text-center">
        <div>Not authorized</div>
      </ContentWrapper>
    );
  }

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
              {!!setupDispensers?.length && (
                <>
                  {setupDispensers?.map((dispenser) => (
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
              )}
              {!!incompleteDispensers?.length && (
                <>
                  <h2 className="w-full text-2xl text-center mb-4">
                    Incomplete Dispensers
                  </h2>
                  {incompleteDispensers?.map((dispenser) => (
                    <Link
                      href={`/me/dispenser/create?step=1&dispenserId=${dispenser.id}`}
                      key={dispenser.id}
                      className="w-full md:w-1/3 p-4 flex justify-center relative"
                    >
                      <RemoveCircleOutline className="absolute top-8 left-8 text-red-500 h-16 w-16 cursor-pointer z-10" />
                      <Card imageUrl={dispenser.imageUrl}>
                        <div className="text-3xl tracking-widest">
                          {dispenser.name}
                        </div>
                        <div className="w-full flex justify-center">
                          <PrimaryButton className="mt-4">
                            Continue Setup
                          </PrimaryButton>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </>
              )}
              {!incompleteDispensers?.length && !setupDispensers?.length && (
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

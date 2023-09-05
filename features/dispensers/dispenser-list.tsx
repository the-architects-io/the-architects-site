import { Dispenser } from "@/app/blueprint/types";
import { Card } from "@/features/UI/card";
import { ContentWrapperYAxisCenteredContent } from "@/features/UI/content-wrapper-y-axis-centered-content";
import Spinner from "@/features/UI/spinner";
import { GET_ENABLED_DISPENSERS } from "@/graphql/queries/get-enabled-dispensers";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useState } from "react";

export const DispenserList = () => {
  const [dispensers, setDispensers] = useState<Dispenser[] | null>(null);

  const { loading } = useQuery(GET_ENABLED_DISPENSERS, {
    onCompleted: ({ dispensers }) => {
      setDispensers(dispensers);
    },
  });

  return (
    <>
      <h1 className="text-4xl mb-12 text-center">Active Loot Boxes</h1>
      <div className="flex w-full max-w-6xl just m-auto flex-wrap h-full">
        {loading ? (
          <ContentWrapperYAxisCenteredContent>
            <Spinner />
          </ContentWrapperYAxisCenteredContent>
        ) : (
          <>
            {!!dispensers &&
              dispensers?.map((lootBox) => (
                <Link
                  href={`/loot-box/${lootBox.id}`}
                  key={lootBox.id}
                  className="w-full md:w-1/3 p-4 flex justify-center"
                >
                  <Card imageUrl={lootBox.imageUrl}>
                    <div className="text-3xl tracking-widest">
                      {lootBox.name}
                    </div>
                  </Card>
                </Link>
              ))}
          </>
        )}
      </div>
    </>
  );
};

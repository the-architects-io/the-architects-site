"use client";
import { Airdrop } from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { RecipientListTable } from "@/features/airdrop/recipient-list-table";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { useState } from "react";

export default function AirdropDetailsPage({ params }: { params: any }) {
  const user = useUserData();
  const [airdrop, setAirdrop] = useState<Airdrop | null>(null);

  const { data } = useQuery(GET_AIRDROP_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    onCompleted: ({ airdrops_by_pk }) => {
      setAirdrop(airdrops_by_pk);
    },
  });

  if (!params?.id)
    return (
      <ContentWrapper className="text-center">
        <div>Dispenser not found</div>
      </ContentWrapper>
    );

  // if (dispenser?.owner?.id !== user?.id) {
  //   return (
  //     <ContentWrapper className="text-center">Not authorized</ContentWrapper>
  //   );
  // }

  return (
    <div className="w-full h-full min-h-screen text-stone-300">
      <ContentWrapper className="text-center">
        <div className="text-2xl font-semibold mb-4">{airdrop?.name}</div>
        <div className="text-lg mb-4">
          <span className="font-semibold">Number of recipients: </span>
          {airdrop?.recipients_aggregate?.aggregate?.count}
        </div>
        <div className="text-lg mb-4">
          {!!airdrop?.recipients?.length && (
            <RecipientListTable recipients={airdrop?.recipients} />
          )}
        </div>
      </ContentWrapper>
    </div>
  );
}

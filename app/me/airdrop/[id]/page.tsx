"use client";
import { Airdrop } from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { ExecuteAirdrop } from "@/features/airdrop/execute-airdrop";
import { RecipientListTable } from "@/features/airdrop/recipient-list-table";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { useState } from "react";

export default function AirdropDetailsPage({ params }: { params: any }) {
  const user = useUserData();
  const [airdrop, setAirdrop] = useState<Airdrop | null>(null);

  const tabs: ITab[] = [
    { name: "Recipients", value: "recipients" },
    { name: "Execute", value: "execute" },
  ];

  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);

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

  return (
    <div className="w-full h-full min-h-screen text-stone-300">
      <ContentWrapper className="text-center">
        <div className="text-2xl font-semibold mb-4">{airdrop?.name}</div>
        <div className="text-lg mb-4">
          <span className="font-semibold">Number of recipients: </span>
          {airdrop?.recipients_aggregate?.aggregate?.count}
        </div>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          handleSetTab={(tab) => setActiveTab(tab)}
        />
        {!!activeTab && activeTab.value === "recipients" && (
          <div className="text-lg mb-4">
            {!!airdrop?.recipients?.length && (
              <RecipientListTable recipients={airdrop?.recipients} />
            )}
          </div>
        )}
        {!!activeTab && activeTab.value === "execute" && (
          <div className="text-lg mb-4">
            {!!airdrop?.recipients?.length && (
              <ExecuteAirdrop airdrop={airdrop} />
            )}
          </div>
        )}
      </ContentWrapper>
    </div>
  );
}

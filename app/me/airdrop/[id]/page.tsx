"use client";
import { Airdrop, Job, StatusUUIDs } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { ExecuteAirdrop } from "@/features/airdrop/execute-airdrop";
import { RecipientListTable } from "@/features/airdrop/recipient-list-table";
import { GET_AIRDROP_BY_ID } from "@/graphql/queries/get-airdrop-by-id";
import { GET_JOB_BY_ID } from "@/graphql/queries/get-job-by-id";
import { useQuery } from "@apollo/client";
import { useUserData } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { Line } from "rc-progress";
import { useEffect, useState } from "react";

export default function AirdropDetailsPage({ params }: { params: any }) {
  const user = useUserData();
  const [airdrop, setAirdrop] = useState<Airdrop | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const router = useRouter();

  const tabs: ITab[] = [
    { name: "Execute", value: "execute" },
    { name: "Recipients", value: "recipients" },
  ];

  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);

  const {
    loading,
    data,
  }: { loading: boolean; data: { jobs_by_pk: Job } | undefined } = useQuery(
    GET_JOB_BY_ID,
    {
      variables: {
        id: jobId,
      },
      skip: !jobId,
      pollInterval: 1000,
      fetchPolicy: "no-cache",
    }
  );

  useQuery(GET_AIRDROP_BY_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    fetchPolicy: "no-cache",
    onCompleted: ({ airdrops_by_pk }) => {
      setAirdrop(airdrops_by_pk);

      if (airdrops_by_pk?.job?.id) setJobId(airdrops_by_pk?.job?.id);
    },
  });

  useEffect(() => {
    if (data?.jobs_by_pk?.status.id === StatusUUIDs.COMPLETE) {
      setJobId(null);
      router.push(`${BASE_URL}/me/airdrop`);
    }
  }, [jobId, data?.jobs_by_pk?.status.id, router]);

  if (!params?.id)
    return (
      <ContentWrapper className="text-center">
        <div>Airdrop not found</div>
      </ContentWrapper>
    );

  return (
    <div className="w-full h-full min-h-screen text-stone-300">
      {!!jobId ? (
        <ContentWrapper>
          {!!data && (
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center pt-32">
                <Spinner />
                <p className="text-4xl font-semibold text-center pt-12">
                  {data?.jobs_by_pk?.statusText}
                </p>
                {/* <Line
                  className="px-4"
                  percent={Number(

                  )}
                  strokeWidth={2}
                  trailWidth={0.04}
                  trailColor="#121212"
                  // sky-400
                  strokeColor="#38bdf8"
                /> */}
              </div>
            </div>
          )}
        </ContentWrapper>
      ) : (
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
                <ExecuteAirdrop airdrop={airdrop} setJobId={setJobId} />
              )}
            </div>
          )}
        </ContentWrapper>
      )}
    </div>
  );
}

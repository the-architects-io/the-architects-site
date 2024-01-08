"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SharedHead from "@/features/UI/head";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { JobsTable } from "@/features/jobs/jobs-table";
import { GET_JOBS } from "@/graphql/queries/get-jobs";
import { useQuery } from "@apollo/client";
import { AdminToolsPanel } from "@/features/admin/tools/tools-panel";

const Admin: NextPage = () => {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const tabs: ITab[] = [
    {
      name: "Jobs",
      value: "jobs",
    },
    {
      name: "Tools",
      value: "tools",
    },
  ];

  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);

  const searchParams = useSearchParams();

  const { loading, data } = useQuery(GET_JOBS, {
    skip: !activeTab || activeTab.value !== "jobs",
  });

  useEffect(() => {
    const searchParam = searchParams.get("tab");
  }, [searchParams]);

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <SharedHead title="Admin" />
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        handleSetTab={(tab) => setActiveTab(tab)}
      />
      {!!activeTab && activeTab.value === "jobs" && data?.jobs?.length && (
        <JobsTable jobs={data.jobs} />
      )}
      {!!activeTab && activeTab.value === "tools" && <AdminToolsPanel />}
    </ContentWrapper>
  );
};

export default Admin;

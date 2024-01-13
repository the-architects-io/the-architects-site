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
import { CollectionsToolkit } from "@/features/toolkit/collections/collections-toolkit";

const Toolkit: NextPage = () => {
  const router = useRouter();

  const tabs: ITab[] = [
    {
      name: "Collections",
      value: "collections",
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

  return (
    <ContentWrapper className="flex flex-col items-center justify-center text-stone-300">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        handleSetTab={(tab) => setActiveTab(tab)}
      />
      {!!activeTab && activeTab.value === "collections" && (
        <CollectionsToolkit />
      )}
    </ContentWrapper>
  );
};

export default Toolkit;

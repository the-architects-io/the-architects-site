"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GET_JOBS } from "@the-architects/blueprint-graphql";

import { useQuery } from "@apollo/client";
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

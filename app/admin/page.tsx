"use client";

import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { NextPage } from "next";
import { ITab, Tabs } from "@/features/UI/tabs/tabs";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SharedHead from "@/features/UI/head";
import { ItemsList } from "@/features/admin/items/items-list";
import { TraitsList } from "@/features/admin/traits/traits-list";
import { CommunitiesList } from "@/features/admin/communities/communities-list";
import { NftCollectionsList } from "@/features/admin/nft-collections/nfts-collection-list";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { ToolsList } from "@/features/admin/tools/tools-list";
import { UsersList } from "@/features/admin/users/users-list";
import { DispensersList } from "@/features/admin/dispensers/dispensers-list";
import { JobsTable } from "@/features/jobs/jobs-table";
import { GET_JOBS } from "@/graphql/queries/get-jobs";
import { useQuery } from "@apollo/client";

const Admin: NextPage = () => {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  const tabs: ITab[] = [{ name: "Jobs", value: "jobs" }];

  const [activeTab, setActiveTab] = useState<ITab>(tabs[0]);

  const searchParams = useSearchParams();

  const { loading, data } = useQuery(GET_JOBS, {});

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
    </ContentWrapper>
  );
};

export default Admin;

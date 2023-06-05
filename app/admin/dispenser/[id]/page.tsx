"use client";

import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useAdmin } from "@/hooks/admin";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { Panel } from "@/features/UI/panel";
import { useFormik } from "formik";
import showToast from "@/features/toasts/show-toast";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import {
  Dispenser,
  HashListCollection,
  ItemCollection,
} from "@/features/admin/dispensers/dispensers-list-item";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { RewardsList } from "@/features/rewards/rewards-list";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Divider } from "@/features/UI/divider";

export type RewardCollection = {
  id: string;
  name: string;
  payoutChance?: number;
  hashListCollection: HashListCollection;
  itemCollection: ItemCollection;
  childRewardCollections?: {
    id: string;
    name: string;
    hashListCollection: HashListCollection;
    itemCollection: ItemCollection;
  }[];
};

export default function DispenserDetailPage({ params }: { params: any }) {
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [dispenser, setDispenser] = useState<Dispenser | null>(null);
  const { isAdmin } = useAdmin();
  const [rewardCollection, setRewardCollection] =
    useState<RewardCollection | null>(null);

  const { data, loading, error } = useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: params?.id },
    skip: !params?.id,
    onCompleted: (data) => {
      const { dispensers_by_pk } = data;
      setDispenser(dispensers_by_pk);
      setHasBeenFetched(true);
    },
  });

  const formik = useFormik({
    initialValues: {
      mintAddress: "",
    },
    onSubmit: async ({ mintAddress }) => {
      // try {
      //   await axios.post("/api/bind-item-to-token", {
      //     mintAddress,
      //     itemId: params?.id,
      //   });
      //   showToast({
      //     primaryMessage: "Item updated",
      //   });
      //   refetch();
      //   formik.setValues({ mintAddress: "" });
      // } catch (error: any) {
      //   console.log("error", error);
      //   showToast({
      //     primaryMessage: "Error updating token",
      //     secondaryMessage: error?.response?.data?.error,
      //   });
      // }
    },
  });

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div className="w-full min-h-screen text-stone-300">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!dispenser && hasBeenFetched && <div>Dispenser not found</div>}
      {!!dispenser && (
        <>
          <ContentWrapper>
            <div className="flex w-full mb-8 px-4">
              <BackButton />
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="mb-8 p-2 bg-stone-800 rounded-2xl">
                <ImageWithFallback
                  src={dispenser.imageUrl}
                  height={120}
                  width={120}
                  className="w-36"
                  alt={dispenser.name}
                />
              </div>
              <Panel className="flex flex-col items-center justify-center">
                <h1 className="text-3xl mb-8">{dispenser.name}</h1>
                {!!dispenser.description && (
                  <div className="italic text-lg">{dispenser.description}</div>
                )}
                <Divider />
                <h2 className="text-xl uppercase mb-4">Rewards</h2>
                {!!dispenser.rewardCollections?.length && (
                  <RewardsList dispenser={dispenser} />
                )}
                <PrimaryButton>Add reward</PrimaryButton>
                {!!dispenser.rarity && (
                  <div className="text-xl mb-2 flex items-center space-x-4">
                    <div>Rarity:</div>
                    <div>{dispenser.rarity.name}</div>
                  </div>
                )}
              </Panel>
            </div>
          </ContentWrapper>
        </>
      )}
    </div>
  );
}

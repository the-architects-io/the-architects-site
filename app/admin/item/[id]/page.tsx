"use client";

import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import { BackButton } from "@/features/UI/buttons/back-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { GET_ITEM_BY_ID } from "@/graphql/queries/get-item-by-id";
import { useAdmin } from "@/hooks/admin";
import { Item } from "@/app/api/add-item/route";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { Panel } from "@/features/UI/panel";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import axios from "axios";
import { useFormik } from "formik";
import showToast from "@/features/toasts/show-toast";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { SecondaryButton } from "@/features/UI/buttons/secondary-button";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";

const ItemDetailPage = () => {
  const [showBindToTokenInput, setShowBindToTokenInput] = useState(false);
  const [hasBeenFetched, setHasBeenFetched] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const { id } = router.query;

  const { data, loading, error, refetch } = useQuery(GET_ITEM_BY_ID, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      console.log("data", data);
      const { sodead_items_by_pk } = data;
      setItem(sodead_items_by_pk);
      setHasBeenFetched(true);
    },
  });

  const formik = useFormik({
    initialValues: {
      mintAddress: "",
    },
    onSubmit: async ({ mintAddress }) => {
      try {
        await axios.post("/api/bind-item-to-token", {
          mintAddress,
          itemId: id,
        });
        showToast({
          primaryMessage: "Item updated",
        });
        refetch();
        formik.setValues({ mintAddress: "" });
      } catch (error: any) {
        console.log("error", error);
        showToast({
          primaryMessage: "Error updating token",
          secondaryMessage: error?.response?.data?.error,
        });
      }
    },
  });

  const handleUnbindToken = async (ev: any) => {
    ev.preventDefault();
    try {
      await axios.post("/api/unbind-item-from-token", {
        id: item?.id,
      });
      showToast({
        primaryMessage: "Item updated",
      });
      refetch();
      formik.setValues({ mintAddress: "" });
    } catch (error: any) {
      console.log("error", error);
      showToast({
        primaryMessage: "Error updating token",
        secondaryMessage: error?.response?.data?.error,
      });
    }
  };

  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <div className="w-full min-h-screen text-stone-300">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {!item && hasBeenFetched && <div>Item not found</div>}
      {!!item && (
        <>
          <ContentWrapper>
            <div className="flex w-full mb-8 px-4">
              <BackButton />
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="mb-8 p-2 bg-stone-800 rounded-2xl">
                <ImageWithFallback
                  src={item.imageUrl}
                  height={120}
                  width={120}
                  className="w-36"
                  alt={item.name}
                />
              </div>
              <Panel className="flex flex-col items-center justify-center">
                <h1 className="text-3xl mb-2">{item.name}</h1>
                <h2 className="mb-4 uppercase">
                  {item.category?.name || "No category"}
                </h2>
                <div className="flex space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    {item.isConsumable ? (
                      <CheckCircleIcon className="text-green-700 h-5 w-5" />
                    ) : (
                      <MinusCircleIcon className="text-red-700 h-5 w-5" />
                    )}
                    <div>Consumable</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.isCraftable ? (
                      <CheckCircleIcon className="text-green-700 h-5 w-5" />
                    ) : (
                      <MinusCircleIcon className="text-red-700 h-5 w-5" />
                    )}
                    <div>Craftable</div>
                  </div>
                </div>
                {!!item.description && (
                  <div className="mb-4 text-stone-700 italic text-lg">
                    {item.description}
                  </div>
                )}
                {!!item.rarity && (
                  <div className="text-xl mb-2 flex items-center space-x-4">
                    <div>Rarity:</div>
                    <div>{item.rarity.name}</div>
                  </div>
                )}
                {!!item.token && (
                  <div className="text-xl mb-2 flex items-center space-x-4">
                    <div>Bound to token:</div>
                    <a
                      className="text-xl underline"
                      href={`https://explorer.solana.com/address/${item.token.mintAddress}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {getAbbreviatedAddress(item.token.mintAddress)}
                    </a>
                    <SecondaryButton
                      className="bg-red-900"
                      onClick={handleUnbindToken}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </SecondaryButton>
                  </div>
                )}
                {!item.token && (
                  <form
                    onSubmit={formik.handleSubmit}
                    className="flex w-full justify-center"
                  >
                    {showBindToTokenInput ? (
                      <div className="flex items-end space-x-4 w-full">
                        <FormInputWithLabel
                          label="Token mint address"
                          name="mintAddress"
                          value={formik.values.mintAddress}
                          onChange={formik.handleChange}
                        />
                        <div className="space-x-2 flex">
                          <SubmitButton
                            isSubmitting={formik.isSubmitting}
                            onClick={formik.handleSubmit}
                          >
                            <PlusCircleIcon className="h-6 w-6" />
                          </SubmitButton>
                          <SecondaryButton
                            className="bg-red-900"
                            onClick={() => setShowBindToTokenInput(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </SecondaryButton>
                        </div>
                      </div>
                    ) : (
                      <PrimaryButton
                        onClick={() => setShowBindToTokenInput(true)}
                      >
                        Bind to Token
                      </PrimaryButton>
                    )}
                  </form>
                )}
              </Panel>
            </div>
          </ContentWrapper>
        </>
      )}
    </div>
  );
};

export default ItemDetailPage;

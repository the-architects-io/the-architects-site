"use client";

import axios from "axios";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { ItemSelectInput } from "@/features/admin/items/item-select-input";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { GET_REWARD_CATEGORIES } from "@/graphql/queries/get-reward-types";
import { GET_ITEMS_BY_REWARD_CATEGORY_ID } from "@/graphql/queries/get-items-by-reward-category-id";
import { Item } from "@/app/blueprint/types";

export const REWARD_CATEGORY_IDS = {
  Item: "7322c862-f67c-4778-b950-6d26f7229c5d",
  Currency: "f2a682e2-9871-4fc0-99ab-7607547c435b",
};

export const AddRewardForm = ({
  dispenserId,
  refetch,
}: {
  dispenserId: string;
  refetch: () => void;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [rewardCategories, setRewardCategories] = useState<
    { id: string; name: string }[]
  >([]);

  const formik = useFormik({
    initialValues: {
      rewardCategoryId: "",
      amount: 0,
      payoutChance: 0,
      isFreezeOnDelivery: false,
      itemId: "",
    },
    onSubmit: async ({
      amount,
      itemId,
      payoutChance,
      isFreezeOnDelivery,
      rewardCategoryId,
    }) => {
      try {
        await axios.post("/api/add-item-reward-collection", {
          amount,
          isFreezeOnDelivery:
            rewardCategoryId === REWARD_CATEGORY_IDS.Currency
              ? false
              : isFreezeOnDelivery,
          dispenserId,
          imageUrl: items.find((item) => item.id === itemId)?.imageUrl,
          name: `${amount}x ${items.find((item) => item.id === itemId)?.name}`,
          payoutChance: payoutChance / 100,
          itemId,
        });
        showToast({
          primaryMessage: "Reward added",
        });
        refetch();
      } catch (error) {
        showToast({
          primaryMessage: "Error adding reward",
        });
      }
    },
  });

  useQuery(GET_ITEMS_BY_REWARD_CATEGORY_ID, {
    variables: {
      rewardCategoryId: formik.values.rewardCategoryId,
    },
    onCompleted: ({ items }) => {
      console.log({ items });
      setItems(items);
    },
  });

  useQuery(GET_REWARD_CATEGORIES, {
    onCompleted: ({ rewardCategories }) => {
      console.log({ rewardCategories });
      setRewardCategories(rewardCategories);
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <SharedHead title="Admin" />
      <SelectInputWithLabel
        value={formik.values.rewardCategoryId}
        label="Reward Type"
        name="rewardCategoryId"
        options={rewardCategories.map(({ name, id }) => ({
          label: name,
          value: id,
        }))}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder="Select a reward type"
        hideLabel={false}
      />
      <ItemSelectInput
        items={items}
        value={formik.values.itemId}
        handleBlur={formik.handleBlur}
        handleChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Amount"
        name="amount"
        type="number"
        value={formik.values.amount}
        onChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Payout chance in %"
        name="payoutChance"
        type="number"
        value={formik.values.payoutChance}
        onChange={formik.handleChange}
      />
      {formik.values.rewardCategoryId !== REWARD_CATEGORY_IDS.Currency && (
        <div className="flex w-full p-2 space-x-8">
          <FormCheckboxWithLabel
            label="Freeze on delivery"
            name="isFreezeOnDelivery"
            value={formik.values.isFreezeOnDelivery}
            onChange={formik.handleChange}
          />
        </div>
      )}
      <div className="flex justify-center w-full">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        />
      </div>
    </FormWrapper>
  );
};

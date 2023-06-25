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
import { GET_ITEMS } from "@/graphql/queries/get-items";
import { Item } from "@/app/api/add-item/route";
import { useState } from "react";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";

export const AddRewardForm = ({
  dispenserId,
  refetch,
}: {
  dispenserId: string;
  refetch: () => void;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const formik = useFormik({
    initialValues: {
      amount: 0,
      payoutChance: 0,
      isFreezeOnDelivery: false,
      itemId: "",
    },
    onSubmit: async ({ amount, itemId, payoutChance, isFreezeOnDelivery }) => {
      try {
        await axios.post("/api/add-item-reward-collection", {
          amount,
          isFreezeOnDelivery,
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

  useQuery(GET_ITEMS, {
    onCompleted: ({ items }) => {
      console.log({ items });
      setItems(items);
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <SharedHead title="Admin" />
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
      <div className="flex w-full p-2 space-x-8">
        <FormCheckboxWithLabel
          label="Freeze on delivery"
          name="isFreezeOnDelivery"
          value={formik.values.isFreezeOnDelivery}
          onChange={formik.handleChange}
        />
      </div>
      <div className="flex justify-center w-full">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        />
      </div>
    </FormWrapper>
  );
};

"use client";

import axios from "axios";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { GET_ITEMS_BY_CATEGORY_ID } from "@the-architects/blueprint-graphql";

import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { Item } from "@/app/blueprint/types";
import { handleError } from "@/utils/errors/log-error";

export const ITEM_CATEGORY_IDS = {
  Currency: "8d5ea141-ed79-42a3-aa09-363ed39a427b",
};

export const AddCostForm = ({
  dispenserId,
  refetch,
  setIsAddingCost,
}: {
  dispenserId: string;
  refetch: () => void;
  setIsAddingCost: (isAddingCost: boolean) => void;
}) => {
  const [costs, setCosts] = useState<Item[]>([]);

  const formik = useFormik({
    initialValues: {
      amount: 0,
      itemId: "",
    },
    onSubmit: async ({ amount, itemId }) => {
      try {
        await axios.post("/api/add-cost-collection", {
          amount,
          dispenserId,
          imageUrl: costs.find((cost) => cost.id === itemId)?.imageUrl,
          name: `${amount} ${costs.find((cost) => cost.id === itemId)?.name}`,
          itemId,
        });
        showToast({
          primaryMessage: "Cost added",
        });
        refetch();
      } catch (error) {
        showToast({
          primaryMessage: "Error adding cost",
        });
        handleError(error as Error);
      } finally {
        setIsAddingCost(false);
      }
    },
  });

  useQuery(GET_ITEMS_BY_CATEGORY_ID, {
    variables: {
      itemCategoryId: ITEM_CATEGORY_IDS.Currency,
    },
    onCompleted: ({ items }) => {
      console.log({ items });
      setCosts(items);
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <SharedHead title="Admin" />
      <SelectInputWithLabel
        value={formik.values.itemId}
        label="Item"
        name="itemId"
        options={costs.map((cost) => ({
          label: cost.name,
          value: cost.id,
        }))}
        onChange={(ev) => {
          formik.handleChange(ev);
        }}
        onBlur={formik.handleBlur}
        placeholder="Select a cost"
        hideLabel={false}
      />
      <FormInputWithLabel
        label="Amount"
        name="amount"
        type="number"
        value={formik.values.amount}
        onChange={formik.handleChange}
      />
      <div className="flex justify-center w-full">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        />
      </div>
    </FormWrapper>
  );
};

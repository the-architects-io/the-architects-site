"use client";
import { useQuery } from "@apollo/client";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { FormikHandlers } from "formik";

import { useEffect, useState } from "react";
import { GET_ITEM_CATEGORIES } from "@the-architects/blueprint-graphql";

interface Props {
  value: string;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  handleSubmit?: FormikHandlers["handleSubmit"];
  hideLabel?: boolean;
}

export type ItemCategory = {
  id: string;
  name: string;
};

export const ItemCategoriesSelectInput = ({
  value,
  handleChange,
  handleBlur,
  handleSubmit,
  hideLabel,
}: Props) => {
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const { data: categoriesData } = useQuery(GET_ITEM_CATEGORIES);

  useEffect(() => {
    if (categoriesData?.itemCategories) {
      setCategoryOptions(
        categoriesData.itemCategories.map((category: ItemCategory) => ({
          label: category.name,
          value: category.id,
        }))
      );
    }
  }, [categoriesData]);

  return (
    <>
      {!!categoryOptions.length && (
        <SelectInputWithLabel
          value={value}
          label="Item category"
          name="categoryId"
          options={categoryOptions}
          onChange={(ev) => {
            handleChange(ev);
            handleSubmit && handleSubmit();
          }}
          onBlur={handleBlur}
          placeholder="Select a category"
          hideLabel={hideLabel}
        />
      )}
    </>
  );
};

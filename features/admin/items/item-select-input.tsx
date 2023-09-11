"use client";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { FormikHandlers } from "formik";

import { useEffect, useState } from "react";
import { Item } from "@/app/blueprint/types";

interface Props {
  value: string;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  handleSubmit?: FormikHandlers["handleSubmit"];
  hideLabel?: boolean;
  items?: Item[];
}

export const ItemSelectInput = ({
  value,
  handleChange,
  handleBlur,
  handleSubmit,
  hideLabel,
  items,
}: Props) => {
  const [itemOptions, setItemOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (items) {
      setItemOptions(
        items.map((item: Item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    }
  }, [items]);

  return (
    <>
      {!!itemOptions.length && (
        <SelectInputWithLabel
          value={value}
          label="Item"
          name="itemId"
          options={itemOptions}
          onChange={(ev) => {
            handleChange(ev);
            handleSubmit && handleSubmit();
          }}
          onBlur={handleBlur}
          placeholder="Select an item"
          hideLabel={hideLabel}
        />
      )}
    </>
  );
};

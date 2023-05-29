import axios from "axios";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import showToast from "@/features/toasts/show-toast";
import SharedHead from "@/features/UI/head";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { ItemCategoriesSelectInput } from "@/features/admin/items/item-categories-select-input";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";

export const AddItemForm = () => {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      name: "",
      imageUrl: "",
      description: "",
      isConsumable: false,
      isCraftable: false,
      itemCategoryId: "",
    },
    onSubmit: async (values) => {
      try {
        await axios.post("/api/add-item", values);
        showToast({
          primaryMessage: "Item added",
        });
        router.push("/admin?tab=items");
      } catch (error) {
        showToast({
          primaryMessage: "Error adding token",
        });
      }
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <SharedHead title="SoDead Admin" />
      <FormInputWithLabel
        label="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Image url"
        name="imageUrl"
        value={formik.values.imageUrl}
        onChange={formik.handleChange}
      />
      <FormTextareaWithLabel
        label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
      />
      <ItemCategoriesSelectInput
        value={formik.values.itemCategoryId}
        handleBlur={formik.handleBlur}
        handleChange={formik.handleChange}
      />
      <div className="flex w-full p-2 space-x-8">
        <FormCheckboxWithLabel
          label="Consumable"
          name="isConsumable"
          value={formik.values.isConsumable}
          onChange={formik.handleChange}
        />
        <FormCheckboxWithLabel
          label="Craftable"
          name="isCraftable"
          value={formik.values.isCraftable}
          onChange={formik.handleChange}
        />
      </div>
      <SubmitButton
        isSubmitting={formik.isSubmitting}
        onClick={formik.handleSubmit}
      />
    </FormWrapper>
  );
};

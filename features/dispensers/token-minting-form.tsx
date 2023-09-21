import { BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import showToast from "@/features/toasts/show-toast";
import { useFormik } from "formik";
import { useState } from "react";

export const TokenMintingForm = ({
  tokenOwnerAddress,
}: {
  tokenOwnerAddress?: string;
}) => {
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      sellerFeeBasisPoints: 8.0,
      imageFile: null,
      tokenOwner: "",
      hasTokenOwner: false,
    },
    onSubmit: async ({
      name,
      description,
      sellerFeeBasisPoints,
      imageFile,
    }) => {
      if (!imageFile) throw new Error("No image file");
      console.log({ imageFile });
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("sellerFeeBasisPoints", String(sellerFeeBasisPoints));
      formData.append("imageFile", imageFile);

      if (tokenOwnerAddress) {
        formData.append("tokenOwner", tokenOwnerAddress);
      } else if (
        formik.values.hasTokenOwner &&
        formik.values.tokenOwner?.length
      ) {
        formData.append("tokenOwner", formik.values.tokenOwner);
      }

      try {
        const res = await fetch(`${BASE_URL}/api/mint-token`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        console.log({ data });
        showToast({
          primaryMessage: "Minted",
          link: {
            url: `https://explorer.solana.com/address/${data.asset.publicKey}?cluster=devnet`,
            title: "View token",
          },
        });
        // formik.setValues({
        //   name: "",
        //   description: "",
        //   sellerFeeBasisPoints: 8.0,
        //   imageFile: null,
        //   tokenOwner: "",
        //   hasTokenOwner: false,
        // });
      } catch (error) {
        console.log({ error });
        showToast({
          primaryMessage: "Error minting token",
        });
      } finally {
        setFormData(null);
      }
    },
  });

  return (
    <FormWrapper onSubmit={formik.handleSubmit}>
      <div className="w-full mb-4">
        <FormInputWithLabel
          label="Name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
      </div>
      <FormInputWithLabel
        label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
      />
      <FormInputWithLabel
        label="Seller Fee Basis Points"
        name="sellerFeeBasisPoints"
        type="number"
        value={formik.values.sellerFeeBasisPoints}
        onChange={formik.handleChange}
      />
      {!tokenOwnerAddress && (
        <>
          <FormCheckboxWithLabel
            label="Mint to a different wallet"
            name="hasTokenOwner"
            value={formik.values.hasTokenOwner}
            onChange={formik.handleChange}
          />
          {formik.values.hasTokenOwner && (
            <FormInputWithLabel
              label="Token owner"
              name="tokenOwner"
              value={formik.values.tokenOwner}
              onChange={formik.handleChange}
            />
          )}
        </>
      )}
      <div className="flex flex-col items-center w-full">
        <input
          className="py-8 mx-auto text-center"
          name="imageFile"
          type="file"
          onChange={(e) => {
            formik.setFieldValue("imageFile", e?.target?.files?.[0]);
          }}
        />
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        />
      </div>
    </FormWrapper>
  );
};

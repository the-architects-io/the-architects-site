import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { useFormik } from "formik";
import { useCluster } from "@/hooks/cluster";
import { getAbbreviatedAddress } from "@/utils/formatting";

export const SetNewUpdateAuthorityForm = ({
  updateAuthorityAddress,
  collectionAddress,
}: {
  updateAuthorityAddress: string;
  collectionAddress: string;
}) => {
  const { cluster } = useCluster();

  const formik = useFormik({
    initialValues: {
      address: "",
    },
    onSubmit: async ({ address }) => {
      // set new UA
    },
  });

  return (
    <div className="flex flex-col space-y-4">
      <p>The new UA will be set to the connected wallet.</p>
      <div className="flex space-x-4">
        <div>New Update Authority Address:</div>
        <div>{getAbbreviatedAddress(formik.values.address)}</div>
      </div>
      <FormInputWithLabel
        label="Mint address of any NFT in collection"
        name="address"
        placeholder="address"
        onChange={formik.handleChange}
        value={formik.values.address}
      />
      <SubmitButton
        isSubmitting={formik.isSubmitting}
        onClick={formik.submitForm}
      >
        Set New Update Authority
      </SubmitButton>
    </div>
  );
};

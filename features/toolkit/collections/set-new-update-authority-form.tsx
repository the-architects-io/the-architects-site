import { BASE_URL } from "@/constants/constants";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import axios from "axios";
import { useFormik } from "formik";
import { useState } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getRpcEndpoint } from "@/utils/rpc";
import { useCluster } from "@/hooks/cluster";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { useWallet } from "@solana/wallet-adapter-react";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { publicKey } from "@metaplex-foundation/umi";
import {
  DasApiAsset,
  dasApi,
} from "@metaplex-foundation/digital-asset-standard-api";
import showToast from "@/features/toasts/show-toast";
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

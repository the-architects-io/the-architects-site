"use client";

import { useFormik } from "formik";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import {
  formatNumberWithCommas,
  getAbbreviatedAddress,
  getStringFromByteArrayString,
} from "@/utils/formatting";
import { useCluster } from "@/hooks/cluster";
import { useQuery } from "@apollo/client";
import { GET_MERKLE_TREES_BY_USER_ID } from "@/graphql/queries/get-merkle-trees-by-user-id";
import {
  ASSET_SHDW_DRIVE_ADDRESS,
  EXECUTION_WALLET_ADDRESS,
  SYSTEM_USER_ID,
} from "@/constants/constants";
import { MerkleTree } from "@/app/blueprint/types";
import { useState } from "react";
import { createBlueprintClient } from "@/app/blueprint/client";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { v4 as uuidv4 } from "uuid";
import { createJsonFileFromObject } from "@/app/blueprint/utils";
import showToast from "@/features/toasts/show-toast";

export const MintCnft = () => {
  const { cluster } = useCluster();
  const [availableMerkleTrees, setAvailableMerkleTrees] = useState<
    (MerkleTree & { label: string; value: string })[]
  >([]);

  const { data } = useQuery(GET_MERKLE_TREES_BY_USER_ID, {
    variables: {
      userId: SYSTEM_USER_ID,
    },
    onCompleted: ({ merkleTrees }) => {
      setAvailableMerkleTrees(
        merkleTrees
          .filter((tree: MerkleTree) => tree.cluster === cluster)
          .map((tree: MerkleTree) => ({
            ...tree,
            label: `${getAbbreviatedAddress(tree.address)} - ${
              formatNumberWithCommas(tree.maxCapacity) ?? 0
            } Max capacity`,
            value: tree.address,
          }))
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      merkleTreeAddress: "",
      sellerFeeBasisPoints: 0,
      name: "",
      uri: "",
      recipient: "",
    },
    onSubmit: async ({
      merkleTreeAddress,
      sellerFeeBasisPoints,
      name,
      recipient,
    }) => {
      const blueprint = await createBlueprintClient({ cluster });

      // export type TokenMetadata = {
      //   name: string;
      //   symbol: string;
      //   description: string;
      //   seller_fee_basis_points: number;
      //   image: string;
      //   animation_url?: string;
      //   external_url: string;
      //   edition?: number;
      //   collection?: {
      //     name: string;
      //     family?: string;
      //   };
      //   attributes: {
      //     trait_type: string;
      //     value: string;
      //   }[];
      //   properties?: {
      //     files: {
      //       uri: string;
      //       type: string;
      //       cdn?: string;
      //     }[];
      //     category: string;
      //     creators: {
      //       address: string;
      //       share: number;
      //     }[];
      //   };
      //   index?: number; // sort order in original metadata JSON file
      // };

      const tokenMetadata = {
        name,
        seller_fee_basis_points: sellerFeeBasisPoints,
        external_url: "https://the-architects.io",
        collection: {
          name: "The Architects cNFT Testing",
        },
      };

      // generate uuid
      const uuid = uuidv4();

      const fileName = `${uuid}.json`;

      const { url } = await blueprint.upload.uploadJson({
        file: createJsonFileFromObject(tokenMetadata),
        fileName,
        driveAddress: ASSET_SHDW_DRIVE_ADDRESS,
      });

      const { signature, result } = await blueprint.tokens.mintCnft({
        merkleTreeAddress,
        creatorAddress: EXECUTION_WALLET_ADDRESS,
        sellerFeeBasisPoints,
        name,
        uri: url,
        leafOwnerAddress: recipient,
      });

      const sigPubKey = getStringFromByteArrayString(signature);

      console.log({
        signature,
        result,
        sigPubKey,
      });

      showToast({
        primaryMessage: "Minted cNFT",
        link: {
          url: `https://explorer.solana.com/tx/${sigPubKey}?cluster=${cluster}`,
          title: "View transaction",
        },
      });
    },
  });

  return (
    <div className="flex flex-col justify-center space-y-4">
      <SelectInputWithLabel
        value={formik.values.merkleTreeAddress}
        label="Merkle Tree"
        name="merkleTreeAddress"
        options={availableMerkleTrees?.map((tree) => ({
          value: tree.address,
          label: tree.label,
        }))}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder="Select system merkle tree"
        hideLabel={false}
      />
      <FormInputWithLabel
        label="Name"
        name="name"
        placeholder="Name"
        onChange={formik.handleChange}
        value={formik.values.name}
      />
      <FormInputWithLabel
        label="Recipient"
        name="recipient"
        placeholder="Recipient"
        onChange={formik.handleChange}
        value={formik.values.recipient}
      />
      <FormInputWithLabel
        label="Seller Fee Basis Points (in %)"
        name="sellerFeeBasisPoints"
        type="number"
        min={0}
        max={100}
        placeholder="Seller Fee Basis Points"
        onChange={formik.handleChange}
        value={formik.values.sellerFeeBasisPoints}
      />
      <div className="pt-4 w-full flex justify-center">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.submitForm}
          disabled={
            formik.isSubmitting ||
            !formik.isValid ||
            !formik.values.merkleTreeAddress?.length
          }
        >
          Mint cNFT
        </SubmitButton>
      </div>
    </div>
  );
};

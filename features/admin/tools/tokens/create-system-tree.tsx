"use client";

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { useCallback, useState } from "react";
import { createBlueprintClient } from "@/app/blueprint/client";
import { useFormik } from "formik";
import { SYSTEM_USER_ID } from "@/constants/constants";
import showToast from "@/features/toasts/show-toast";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { formatNumberWithCommas } from "@/utils/formatting";

// https://developers.metaplex.com/bubblegum/create-trees
// maxDepth	maxBufferSize	maxNumberOfCNFTs
// 3	8	8
// 5	8	32
// 14	64	16,384
// 14	256	16,384
// 14	1,024	16,384
// 14	2,048	16,384
// 15	64	32,768
// 16	64	65,536
// 17	64	131,072
// 18	64	262,144
// 19	64	524,288
// 20	64	1,048,576
// 20	256	1,048,576
// 20	1,024	1,048,576
// 20	2,048	1,048,576
// 24	64	16,777,216
// 24	256	16,777,216
// 24	512	16,777,216
// 24	1,024	16,777,216
// 24	2,048	16,777,216
// 26	512	67,108,864
// 26	1,024	67,108,864
// 26	2,048	67,108,864
// 30	512	1,073,741,824
// 30	1,024	1,073,741,824
// 30	2,048	1,073,741,824

type MaxNumberOfCnft =
  | 8
  | 32
  | 16384
  | 32768
  | 65536
  | 131072
  | 262144
  | 524288
  | 1048576
  | 16777216
  | 67108864
  | 1073741824;

export const maxNumberOfCnftsInMerkleTree = [
  8, 32, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 16777216,
  67108864, 1073741824,
];

const isValidMaxNumberOfCnftsInMerkleTree = (maxNumberOfCnfts: number) => {
  return [
    8, 32, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 16777216,
    67108864, 1073741824,
  ].includes(maxNumberOfCnfts);
};

export const getMaxBufferSize = (maxNumberOfCnfts: MaxNumberOfCnft) => {
  if (maxNumberOfCnfts === 8) {
    return 8;
  }
  if (maxNumberOfCnfts === 32) {
    return 8;
  }
  if (maxNumberOfCnfts === 16384) {
    return 64;
  }
  if (maxNumberOfCnfts === 32768) {
    return 64;
  }
  if (maxNumberOfCnfts === 65536) {
    return 64;
  }
  if (maxNumberOfCnfts === 131072) {
    return 64;
  }
  if (maxNumberOfCnfts === 262144) {
    return 64;
  }
  if (maxNumberOfCnfts === 524288) {
    return 64;
  }
  if (maxNumberOfCnfts === 1048576) {
    return 64;
  }
  if (maxNumberOfCnfts === 16777216) {
    return 64;
  }
  if (maxNumberOfCnfts === 67108864) {
    return 512;
  }
  if (maxNumberOfCnfts === 1073741824) {
    return 512;
  }
};

export const getMaxDepth = (maxNumberOfCnfts: MaxNumberOfCnft) => {
  if (maxNumberOfCnfts === 8) {
    return 3;
  }
  if (maxNumberOfCnfts === 32) {
    return 5;
  }
  if (maxNumberOfCnfts === 16384) {
    return 14;
  }
  if (maxNumberOfCnfts === 32768) {
    return 15;
  }
  if (maxNumberOfCnfts === 65536) {
    return 16;
  }
  if (maxNumberOfCnfts === 131072) {
    return 17;
  }
  if (maxNumberOfCnfts === 262144) {
    return 18;
  }
  if (maxNumberOfCnfts === 524288) {
    return 19;
  }
  if (maxNumberOfCnfts === 1048576) {
    return 20;
  }
  if (maxNumberOfCnfts === 16777216) {
    return 24;
  }
  if (maxNumberOfCnfts === 67108864) {
    return 26;
  }
  if (maxNumberOfCnfts === 1073741824) {
    return 30;
  }
};

export const CreateSystemTree = () => {
  const handleCreateSystemMerkleTree = useCallback(
    async (maxNumberOfCnfts: MaxNumberOfCnft) => {
      const maxDepth = getMaxDepth(Number(maxNumberOfCnfts) as MaxNumberOfCnft);
      const maxBufferSize = getMaxBufferSize(
        Number(maxNumberOfCnfts) as MaxNumberOfCnft
      );

      if (!maxDepth || !maxBufferSize) {
        throw new Error("Invalid max depth or max buffer size");
      }

      const client = createBlueprintClient({
        cluster: "devnet",
      });

      const { merkleTreeAddress } = await client.tokens.createTree({
        maxDepth,
        maxBufferSize,
        userId: SYSTEM_USER_ID,
      });

      showToast({
        primaryMessage: "Success",
        secondaryMessage: `Merkle tree created at ${merkleTreeAddress}`,
        link: {
          url: `https://explorer.solana.com/address/${merkleTreeAddress}?cluster=devnet`,
          title: "View Explorer",
        },
      });
    },
    []
  );

  const formik = useFormik({
    initialValues: {
      maxNumberOfCnfts: 8,
    },
    onSubmit: async ({ maxNumberOfCnfts }) => {
      if (!isValidMaxNumberOfCnftsInMerkleTree(maxNumberOfCnfts)) {
        throw new Error("Invalid max number of cnfts");
      }

      await handleCreateSystemMerkleTree(maxNumberOfCnfts as MaxNumberOfCnft);
    },
  });

  return (
    <div className="flex flex-col justify-center space-y-4">
      <SelectInputWithLabel
        value={formik.values.maxNumberOfCnfts}
        label="Max number of CNFTs tree can hold"
        name="maxNumberOfCnfts"
        options={maxNumberOfCnftsInMerkleTree.map((maxNumber) => ({
          value: maxNumber.toString(),
          label: formatNumberWithCommas(maxNumber),
        }))}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        placeholder="Select max number of CNFTs"
        hideLabel={false}
      />
      <SubmitButton
        isSubmitting={formik.isSubmitting}
        onClick={formik.submitForm}
      >
        <PlusCircleIcon className="w-6 h-6 mr-2" />
        Create System Merkle Tree
      </SubmitButton>
    </div>
  );
};

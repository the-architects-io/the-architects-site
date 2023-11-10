import { LOCAL_OR_REMOTE } from "@/app/blueprint/types";
import { BASE_URL, DEVNET_TREE_ADDRESS } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import {
  MerkleTree,
  createTree,
  fetchMerkleTree,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  KeypairSigner,
  Umi,
  generateSigner,
  publicKey,
} from "@metaplex-foundation/umi";
import axios from "axios";
import { useFormik } from "formik";
import { useCallback } from "react";

export default function MerkleTreeForm({
  umi,
  setMerkleTree,
  setIsLoading,
  isLoading,
  localOrRemote = "local",
}: {
  umi: Umi | null;
  setMerkleTree: (merkleTree: MerkleTree | KeypairSigner) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  localOrRemote?: "local" | "remote";
}) {
  // 8 NFTs
  // const selectedMaxDepth = 3;
  // const selectedMaxBufferSize = 8;

  // 32 NFTs
  // const selectedMaxDepth = 5;
  // const selectedMaxBufferSize = 8;

  // 16,384 NFTs
  const selectedMaxDepth = 14;
  const selectedMaxBufferSize = 64;

  const formik = useFormik({
    initialValues: {
      merkleTreeAddress: DEVNET_TREE_ADDRESS,
      isCreatingNewTree: false,
    },
    onSubmit: async ({ merkleTreeAddress }) => {
      if (!umi) return;
      const merkleTreeAccount = await fetchMerkleTree(
        umi,
        publicKey(merkleTreeAddress)
      );

      setMerkleTree(merkleTreeAccount);
    },
  });

  const handleRemoteCreateTree = useCallback(async () => {
    if (!umi) return;
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${BASE_URL}/api/create-tree`, {
        maxDepth: selectedMaxDepth,
        maxBufferSize: selectedMaxBufferSize,
      });
      const { merkleTreeAddress } = data;
      const merkleTree = await fetchMerkleTree(
        umi,
        publicKey(merkleTreeAddress)
      );
      showToast({
        primaryMessage: "Merkle Tree Created",
        link: {
          url: `https://solscan.io/account/${merkleTreeAddress}?cluster=devnet`,
          title: "View account",
        },
      });
      setMerkleTree(merkleTree);
      setMerkleTree(merkleTree);
    } catch (error) {
      console.log({ error });
      showToast({
        primaryMessage: "Error creating Merkle Tree",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setMerkleTree, umi]);

  const handleCreateTree = useCallback(async () => {
    if (localOrRemote === LOCAL_OR_REMOTE.REMOTE) {
      handleRemoteCreateTree();
      return;
    }

    if (!umi) return;
    setIsLoading(true);

    try {
      const merkleTree = generateSigner(umi);
      const builder = await createTree(umi, {
        merkleTree,
        maxDepth: selectedMaxDepth,
        maxBufferSize: selectedMaxBufferSize,
      });
      await builder.sendAndConfirm(umi);
    } catch (error) {
      showToast({
        primaryMessage: "Error creating Merkle Tree",
      });
    } finally {
      setIsLoading(false);
    }
  }, [handleRemoteCreateTree, localOrRemote, setIsLoading, umi]);

  return (
    <FormWrapper
      onSubmit={formik.handleSubmit}
      className="w-full flex flex-col"
    >
      <FormInputWithLabel
        label="Load Merkle Tree by Address"
        name="merkleTreeAddress"
        value={formik.values.merkleTreeAddress}
        onChange={formik.handleChange}
      />
      <div className="flex w-full justify-center">
        <SubmitButton
          disabled={isLoading}
          isSubmitting={formik.isSubmitting}
          onClick={formik.handleSubmit}
        >
          Load Tree
        </SubmitButton>
      </div>
      <div className="py-8 text-4xl">- OR -</div>
      <PrimaryButton
        onClick={(e) => {
          e.preventDefault();
          handleCreateTree();
        }}
        className="flex w-full justify-center"
      >
        {isLoading ? <Spinner /> : "Create Merkle Tree"}
      </PrimaryButton>
    </FormWrapper>
  );
}

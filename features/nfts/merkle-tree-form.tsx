import { createBlueprintClient } from "@/app/blueprint/client";
import { LOCAL_OR_REMOTE } from "@/app/blueprint/types";
import { BASE_URL, DEVNET_TREE_ADDRESS } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { useCluster } from "@/hooks/cluster";
import { handleError } from "@/utils/errors/log-error";
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
// 8 NFTs
// const selectedMaxDepth = 3;
// const selectedMaxBufferSize = 8;

// 32 NFTs
// const selectedMaxDepth = 5;
// const selectedMaxBufferSize = 8;

// 16,384 NFTs
const selectedMaxDepth = 14;
const selectedMaxBufferSize = 64;

const NftAmounts = [
  {
    maxDepth: 3,
    maxBufferSize: 8,
    mftAmount: 8,
  },
  {
    maxDepth: 5,
    maxBufferSize: 8,
    mftAmount: 32,
  },
  {
    maxDepth: 14,
    maxBufferSize: 64,
    mftAmount: 16384,
  },
];

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
  const { cluster } = useCluster();

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

    const blueprint = createBlueprintClient({
      cluster,
    });

    try {
      const { success, merkleTreeAddress } = await blueprint.tokens.createTree({
        maxDepth: selectedMaxDepth,
        maxBufferSize: selectedMaxBufferSize,
      });

      if (!success) throw new Error("Error creating Merkle Tree");

      let tree: MerkleTree | null = null;

      const interval = setInterval(async () => {
        console.log("fetching merkle tree");
        try {
          const merkleTree = await fetchMerkleTree(
            umi,
            publicKey(merkleTreeAddress)
          );
          if (merkleTree) {
            tree = merkleTree;
            console.log("found tree", merkleTree);
            clearInterval(interval);
            setMerkleTree(merkleTree);
          } else {
            console.log("no tree found, trying again");
          }
        } catch (error) {
          handleError(error as Error);
        }
      }, 3000);

      showToast({
        primaryMessage: "Merkle Tree Created",
        link: {
          url: `https://solscan.io/account/${merkleTreeAddress}?cluster=devnet`,
          title: "View account",
        },
      });
      if (tree) setMerkleTree(tree);
    } catch (error) {
      handleError(error as Error);
      showToast({
        primaryMessage: "Error creating Merkle Tree",
      });
    } finally {
      setIsLoading(false);
    }
  }, [cluster, setIsLoading, setMerkleTree, umi]);

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
      handleError(error as Error);
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
      <Panel className="space-y-2 mb-8">
        <div className="flex">
          <div className="mr-4">Max Depth:</div>
          {selectedMaxDepth}
        </div>
        <div className="flex">
          <div className="mr-4">Max Buffer Size:</div>
          {selectedMaxBufferSize}
        </div>
        <div className="flex">
          <div className="mr-4">NFT Amount:</div>
          {
            NftAmounts.find(
              ({ maxDepth, maxBufferSize }) =>
                maxDepth === selectedMaxDepth &&
                maxBufferSize === selectedMaxBufferSize
            )?.mftAmount
          }
        </div>
      </Panel>
      <div className="flex w-full justify-center">
        <PrimaryButton
          onClick={(e) => {
            e.preventDefault();
            handleCreateTree();
          }}
        >
          {isLoading ? <Spinner /> : "Create Merkle Tree"}
        </PrimaryButton>
      </div>
    </FormWrapper>
  );
}

import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormCheckboxWithLabel } from "@/features/UI/forms/form-checkbox-with-label";
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
import { useFormik } from "formik";
import { useCallback } from "react";

export default function MerkleTreeForm({
  umi,
  setMerkleTree,
  setIsLoading,
  isLoading,
}: {
  umi: Umi | null;
  setMerkleTree: (merkleTree: MerkleTree | KeypairSigner) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}) {
  const formik = useFormik({
    initialValues: {
      merkleTreeAddress: "3iKR49oEAQ6SigJfH7ApmwmPZsFQLeg4vJWCqWJP16p3",
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

  const handleCreateTree = useCallback(async () => {
    if (!umi) return;

    setIsLoading(true);

    try {
      const merkleTree = generateSigner(umi);
      const builder = await createTree(umi, {
        merkleTree,
        maxDepth: 3,
        maxBufferSize: 8,
      });
      await builder.sendAndConfirm(umi);
      showToast({
        primaryMessage: "Merkle Tree Created",
      });
      setMerkleTree(merkleTree);
    } catch (error) {
      showToast({
        primaryMessage: "Error creating Merkle Tree",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setMerkleTree, umi]);

  return (
    <FormWrapper
      onSubmit={formik.handleSubmit}
      className="w-full flex flex-col"
    >
      <div className="pb-4">
        <FormCheckboxWithLabel
          label="Create New Merkle Tree"
          name="isCreatingNewTree"
          value={formik.values.isCreatingNewTree}
          onChange={formik.handleChange}
        />
      </div>

      <>
        {formik.values.isCreatingNewTree ? (
          <PrimaryButton
            onClick={handleCreateTree}
            className="flex w-full justify-center"
          >
            {isLoading ? <Spinner /> : "Create Merkle Tree"}
          </PrimaryButton>
        ) : (
          <>
            <FormInputWithLabel
              label="Merkle Tree Address"
              name="merkleTreeAddress"
              value={formik.values.merkleTreeAddress}
              onChange={formik.handleChange}
            />
            <div className="flex pt-4 w-full justify-center">
              <SubmitButton
                className=""
                disabled={isLoading}
                isSubmitting={formik.isSubmitting}
                onClick={formik.handleSubmit}
              >
                Load Tree
              </SubmitButton>
            </div>
          </>
        )}
      </>
    </FormWrapper>
  );
}

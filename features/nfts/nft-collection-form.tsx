import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormInputWithLabel } from "@/features/UI/forms/form-input-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import {
  MerkleTree,
  mintToCollectionV1,
} from "@metaplex-foundation/mpl-bubblegum";
import { mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import {
  KeypairSigner,
  Umi,
  generateSigner,
  none,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useFormik } from "formik";

export default function NftCollectionForm({
  umi,
  merkleTreeAddress,
}: {
  umi: Umi | null;
  merkleTreeAddress: string;
}) {
  const wallet = useWallet();

  const formik = useFormik({
    initialValues: {
      collectionName: "",
      uri: "",
    },
    onSubmit: async ({ collectionName, uri }) => {
      if (!umi || !merkleTreeAddress || !wallet?.publicKey) return;

      // first upload jsson to shdw
      const offchainDataUri = "";

      // then mint to collection
      // const collectionMint = generateSigner(umi);
      // const mintRes = await createNft(umi, {
      //   mint: collectionMint,
      //   name: collectionName,
      //   uri: offchainDataUri,
      //   sellerFeeBasisPoints: percentAmount(10), // 5.5%
      //   isCollection: true,
      // }).sendAndConfirm(umi);

      // console.log({ mintRes });
      // debugger;
    },
  });

  if (!umi || !merkleTreeAddress) return null;

  return (
    <div className="flex flex-col justify-center items-center w-full mb-4 space-y-4">
      <FormWrapper>
        <FormInputWithLabel
          label="Collection Name"
          name="collectionName"
          placeholder="Collection Name"
          onChange={formik.handleChange}
          value={formik.values.collectionName}
        />
        <SubmitButton
          onClick={formik.handleSubmit}
          isSubmitting={formik.isSubmitting}
        >
          Mint Collection NFT
        </SubmitButton>
      </FormWrapper>
    </div>
  );
}

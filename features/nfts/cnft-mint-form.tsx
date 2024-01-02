import { createBlueprintClient } from "@/app/blueprint/client";
import { LOCAL_OR_REMOTE } from "@/app/blueprint/types";
import {
  BASE_URL,
  DDK_ASSET_SHDW_DRIVE_ADDRESS,
  EXECUTION_WALLET_ADDRESS,
} from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { FormTextareaWithLabel } from "@/features/UI/forms/form-textarea-with-label";
import { FormWrapper } from "@/features/UI/forms/form-wrapper";
import { Panel } from "@/features/UI/panel";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { makeNumberArray } from "@/utils/formatting";
import { Umi, isPublicKey, publicKey } from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useFormik } from "formik";
import { useCallback, useState } from "react";

const { LOCAL, REMOTE } = LOCAL_OR_REMOTE;

export default function CnftMintForm({
  umi,
  merkleTreeAddress,
  collectionNftAddress,
  creatorAddress,
  isLocalOrRemote = LOCAL,
  sellerFeeBasisPoints,
  isLoading,
  setIsLoading,
}: {
  umi: Umi | null;
  merkleTreeAddress: string;
  collectionNftAddress: string;
  creatorAddress: string;
  isLocalOrRemote: LOCAL_OR_REMOTE;
  sellerFeeBasisPoints: number;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}) {
  const wallet = useWallet();
  const [recipientList, setRecipientList] = useState<string[]>([]);
  const [mintedIds, setMintedIds] = useState<number[]>([]);
  const [failedMintedIds, setFailedMintedIds] = useState<number[]>([]);
  const [successfulRecipients, setSuccessfulRecipients] = useState<string[]>(
    []
  );
  const [failedRecipients, setFailedRecipients] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: {
      recipientList: "",
    },
    onSubmit: (values) => {
      const list = JSON.parse(values.recipientList)
        .map((item: string) => item.trim())
        .filter((recipient: string) => !recipientList.includes(recipient));

      setRecipientList((recipientList) => [...recipientList, ...list]);
      formik.setValues({ recipientList: "" });
      formik.setSubmitting(false);
    },
  });

  const handleMintCnftsToCollectionRemote = useCallback(async () => {
    setIsLoading(true);
    if (!recipientList.length) return;

    showToast({
      primaryMessage: "Minting cNFTs",
      secondaryMessage: "Please wait...",
    });

    const nftIds = makeNumberArray(5000);

    const blueprint = createBlueprintClient({
      cluster: "devnet",
    });

    for (let i = 0; i < nftIds.length; i++) {
      const id = nftIds[i];

      const uri = `https://shdw-drive.genesysgo.net/${DDK_ASSET_SHDW_DRIVE_ADDRESS}/${id}.json`;
      const { data: nftMetadata } = await axios.get(uri);

      const recipient = recipientList[i];

      try {
        const { success, collectionAddress, signature } =
          await blueprint.tokens.mintCnft({
            merkleTreeAddress,
            collectionNftAddress,
            creatorAddress,
            sellerFeeBasisPoints,
            name: nftMetadata.name,
            uri,
            leafOwnerAddress: recipient,
          });

        console.log(`Successfully minted cNFT #${id} to ${recipient}`, {
          success,
          collectionAddress,
          signature,
        });

        setMintedIds((mintedIds) => [...mintedIds, id]);
      } catch (error) {
        setFailedMintedIds((failedMintedIds) => [...failedMintedIds, id]);
        console.log({ error });
      }
    }

    console.log({
      mintedIds,
      failedMintedIds,
      successfulRecipients,
      failedRecipients,
    });

    showToast({
      primaryMessage: "cNFTs minted",
    });

    setIsLoading(false);
  }, [
    setIsLoading,
    recipientList,
    mintedIds,
    failedMintedIds,
    successfulRecipients,
    failedRecipients,
    merkleTreeAddress,
    collectionNftAddress,
    creatorAddress,
    sellerFeeBasisPoints,
  ]);

  const handleMintCnftsToCollection = async () => {
    if (!umi || !merkleTreeAddress || !wallet?.publicKey) return;

    if (!isPublicKey(collectionNftAddress)) {
      showToast({
        primaryMessage: "Invalid NFT address",
      });
      return;
    }

    const collectionMint = publicKey(collectionNftAddress);

    if (!isPublicKey(creatorAddress)) {
      showToast({
        primaryMessage: "Invalid creator address",
      });
      return;
    }

    const creatorAddressPublicKey = publicKey(creatorAddress);

    if (isNaN(sellerFeeBasisPoints)) {
      showToast({
        primaryMessage: "Invalid seller fee basis points",
      });
      return;
    }

    if (isLocalOrRemote === REMOTE) {
      handleMintCnftsToCollectionRemote();
      return;
    }

    // await mintToCollectionV1(umi, {
    //   leafOwner: publicKey(wallet.publicKey),
    //   merkleTree: publicKey(merkleTreeAddress),
    //   collectionMint,
    //   metadata: {
    //     name: "TEST Dinodawgs Airdrops #0",
    //     uri: "https://shdw-drive.genesysgo.net/6V8LykNmNhn9oJ3t5qTSsv7r6FjJ3VUSmmjx6ggG3wa8/0-test.json",
    //     sellerFeeBasisPoints: 1000,
    //     collection: { key: collectionMint, verified: false },
    //     creators: [
    //       {
    //         address: creatorAddressPublicKey,
    //         verified: false,
    //         share: 100,
    //       },
    //     ],
    //   },
    // }).sendAndConfirm(umi);
  };

  if (!umi || !merkleTreeAddress) return null;

  return (
    <div className="flex flex-col justify-center items-center w-full mb-4 space-y-4">
      <Panel>
        <div className="flex flex-col justify-center space-y-2 text-lg">
          {!!recipientList.length && (
            <div className="flex space-x-2">
              <div className="mr-4">Recipients:</div>
              {recipientList.length}
            </div>
          )}
          <div className="flex space-x-2">
            <div className="mr-4">Minted cNFTs:</div>
            {mintedIds.length}
          </div>
          <div className="flex space-x-2">
            <div className="mr-4">Failed cNFTs:</div>
            {failedMintedIds.length}
          </div>
        </div>
      </Panel>

      <FormWrapper onSubmit={formik.handleSubmit}>
        <FormTextareaWithLabel
          label="Recipient list"
          name="recipientList"
          value={formik.values.recipientList}
          onChange={formik.handleChange}
        />
        <div className="w-full flex justify-center">
          <SubmitButton
            onClick={formik.handleSubmit}
            isSubmitting={formik.isSubmitting}
            disabled={formik.isSubmitting || !formik.values.recipientList}
          >
            Add Recipients
          </SubmitButton>
        </div>
      </FormWrapper>
      <PrimaryButton
        onClick={(e) => {
          e.preventDefault();
          handleMintCnftsToCollection();
        }}
        disabled={isLoading}
      >
        {isLoading ? <Spinner /> : "Mint cNFTs"}
      </PrimaryButton>
    </div>
  );
}

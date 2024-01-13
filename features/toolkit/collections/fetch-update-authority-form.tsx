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

export const FetchUpdateAuthorityForm = ({
  updateAuthorityAddress,
  setUpdateAuthorityAddress,
  collectionAddress,
  setCollectionAddress,
}: {
  updateAuthorityAddress: string;
  setUpdateAuthorityAddress: (address: string) => void;
  collectionAddress: string;
  setCollectionAddress: (address: string) => void;
}) => {
  const [isFetchingTokenMetadata, setIsFetchingTokenMetadata] = useState(false);
  const { cluster } = useCluster();
  const wallet = useWallet();

  const getTokenMetadata = async (address: string) => {
    setIsFetchingTokenMetadata(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/get-token-metadata-from-helius`,
        {
          mintAddress: address,
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return null;
    } finally {
      setIsFetchingTokenMetadata(false);
    }
  };

  const getCollectionAddressFromMetadata = ({
    content,
    grouping,
  }: DasApiAsset) => {
    // TNECT: ho4EzDiBTR47LLgKatgXDjyuQVzDL5uPGsmNGZKuCPJ
    console.log({ content, grouping });
    const collectionAddress = grouping.find(
      (g) => g.group_key === "collection"
    )?.group_value;

    if (!collectionAddress) {
      console.log("No on-chain collection found for this NFT");
      showToast({
        primaryMessage: "No on-chain collection found for this NFT",
      });
      return null;
    }

    return collectionAddress;
  };

  const getAssetInfo = async (address: string) => {
    const umi = await createUmi(getRpcEndpoint(cluster))
      .use(mplToolbox())
      .use(mplTokenMetadata())
      .use(dasApi())
      .use(walletAdapterIdentity(wallet));

    const asset = await umi.rpc.getAsset(publicKey(address));
    console.log({ asset });
    return asset;
  };

  const formik = useFormik({
    initialValues: {
      address: "",
    },
    onSubmit: async ({ address }) => {
      const metadata = await getAssetInfo(address);
      const collectionAddress = getCollectionAddressFromMetadata(metadata);

      if (!!collectionAddress) {
        setCollectionAddress(collectionAddress);
        const collectionMetadata = await getAssetInfo(
          publicKey(collectionAddress)
        );

        if (!!collectionMetadata) {
          const collectionUA = collectionMetadata.authorities?.[0]?.address;
          if (!!collectionUA) setUpdateAuthorityAddress(collectionUA);
        }
      }
    },
  });

  return (
    <div className="flex flex-col space-y-4">
      <FormInputWithLabel
        label="Mint address of any NFT in collection"
        name="address"
        placeholder="address"
        onChange={formik.handleChange}
        value={formik.values.address}
      />
      <div className="flex justify-center w-full pt-4">
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          onClick={formik.submitForm}
        >
          Fetch
        </SubmitButton>
      </div>
    </div>
  );
};

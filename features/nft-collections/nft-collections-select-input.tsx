"use client";
import { useQuery } from "@apollo/client";
import { SelectInputWithLabel } from "@/features/UI/forms/select-input-with-label";
import { FormikHandlers } from "formik";

import { useEffect, useState } from "react";
import { GET_NFT_COLLECTIONS } from "@/graphql/queries/get-nft-collections";
import { NftCollection } from "@/features/admin/nft-collections/nfts-collection-list-item";

interface Props {
  value: string;
  handleChange: FormikHandlers["handleChange"];
  handleBlur: FormikHandlers["handleBlur"];
  handleSubmit?: FormikHandlers["handleSubmit"];
  hideLabel?: boolean;
}

export type ItemCategory = {
  id: string;
  name: string;
};

export const NftCollectionsSelectInput = ({
  value,
  handleChange,
  handleBlur,
  handleSubmit,
  hideLabel,
}: Props) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  const { data: nftCollectionsData } = useQuery(GET_NFT_COLLECTIONS);

  useEffect(() => {
    if (nftCollectionsData?.nftCollections) {
      setOptions(
        nftCollectionsData.nftCollections.map((collection: NftCollection) => ({
          label: collection.name,
          value: collection.id,
        }))
      );
    }
  }, [nftCollectionsData]);

  return (
    <>
      {!!options.length && (
        <SelectInputWithLabel
          value={value}
          label="Nft collections"
          name="nftCollectionId"
          options={options}
          onChange={(ev) => {
            handleChange(ev);
            handleSubmit && handleSubmit();
          }}
          onBlur={handleBlur}
          placeholder="Select a collection"
          hideLabel={hideLabel}
        />
      )}
    </>
  );
};

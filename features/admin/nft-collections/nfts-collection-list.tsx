import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";

import { GET_NFT_COLLECTIONS } from "@/graphql/queries/get-nft-collections";
import {
  NftCollection,
  NftCollectionsListItem,
} from "@/features/admin/nft-collections/nfts-collection-list-item";

export const NftCollectionsList = () => {
  const { data } = useQuery(GET_NFT_COLLECTIONS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.nftCollections?.map((collection: NftCollection) => {
        return (
          <NftCollectionsListItem key={collection.id} collection={collection} />
        );
      })}
    </TableWrapper>
  );
};

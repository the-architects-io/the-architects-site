import { gql } from "@apollo/client";

export const GET_TRAITS_BY_NFT_COLLECTION = gql`
  query GET_TRAITS_BY_NFT_COLLECTION($nftCollectionId: uuid!) {
    traits(where: { nftCollectionId: { _eq: $nftCollectionId } }) {
      id
      name
      nftCollection {
        id
        name
      }
    }
  }
`;

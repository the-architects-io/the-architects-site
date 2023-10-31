import { gql } from "graphql-request";

export const ADD_NFT_COLLECTION = gql`
  mutation ADD_NFT_COLLECTION(
    $nftCollection: nftCollections_insert_input = {}
  ) {
    insert_nftCollections_one(object: $nftCollection) {
      id
      name
      mintAddress
      symbol
      imageUrl
      createdAt
      firstVerifiedCreator
    }
  }
`;

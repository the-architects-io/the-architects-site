import { gql } from "@apollo/client";

export const GET_COLLECTION_BY_ID = gql`
  query GET_COLLECTION_BY_ID($id: uuid!) {
    collections_by_pk(id: $id) {
      id
      createdAt
      updatedAt
      owner {
        id
      }
      name
      community {
        id
      }
      imageUrl
      family
      hasBeenMinted
      symbol
      description
      isComplete
      unmintedMetadatas {
        id
      }
      nft {
        id
      }
      creators {
        id

        share
      }
    }
  }
`;

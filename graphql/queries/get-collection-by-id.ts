import { gql } from "@apollo/client";

export const GET_COLLECTION_BY_ID = gql`
  query GET_COLLECTION_BY_ID($id: uuid!) {
    collections_by_pk(id: $id) {
      id
      creators {
        id
        wallet {
          address
        }
      }
      createdAt
      family
      driveAddress
      description
      hasBeenMinted
      imageUrl
      isReadyToMint
      name
      owner {
        id
      }
      sellerFeeBasisPoints
      symbol
      updatedAt
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_COLLECTIONS_BY_OWNER_ID = gql`
  query MyQuery($id: uuid!) {
    collections(where: { ownerId: { _eq: $id } }) {
      createdAt
      community {
        id
        name
        imageUrl
      }
      id
      family
      driveAddress
      description
      creators {
        id
        share
        wallet {
          address
          id
        }
      }
      name
      imageUrl
      isReadyToMint
      sellerFeeBasisPoints
      symbol
      updatedAt
    }
  }
`;

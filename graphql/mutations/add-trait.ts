import { gql } from "@apollo/client";

export const ADD_TRAIT = gql`
  mutation ADD_TRAIT($name: String!, $nftCollectionId: uuid!) {
    insert_traits_one(
      object: { name: $name, nftCollectionId: $nftCollectionId }
    ) {
      nftCollection {
        id
        name
      }
      name
      id
    }
  }
`;

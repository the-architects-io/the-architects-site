import { gql } from "@apollo/client";

export const ADD_CREATURE = gql`
  mutation ADD_CREATURE(
    $name: String!
    $tokenId: uuid!
    $imageUrl: String!
    $creatureCategoryId: uuid = ""
  ) {
    insert_creatures_one(
      object: {
        name: $name
        tokenId: $tokenId
        imageUrl: $imageUrl
        creatureCategoryId: $creatureCategoryId
      }
    ) {
      id
      name
    }
  }
`;

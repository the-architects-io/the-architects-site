import { gql } from "@apollo/client";

export const ADD_CHARACTER = gql`
  mutation ADD_CHARACTER($name: String!, $tokenId: uuid!, $imageUrl: String!) {
    character_one(
      object: { name: $name, tokenId: $tokenId, imageUrl: $imageUrl }
    ) {
      id
      name
    }
  }
`;

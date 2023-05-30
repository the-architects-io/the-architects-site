import { gql } from "@apollo/client";

export const ADD_TOKEN = gql`
  mutation ADD_TOKEN(
    $decimals: Int!
    $imageUrl: String!
    $mintAddress: String!
    $name: String!
    $symbol: String!
  ) {
    insert_tokens_one(
      object: {
        decimals: $decimals
        imageUrl: $imageUrl
        mintAddress: $mintAddress
        name: $name
        symbol: $symbol
      }
    ) {
      decimals
      id
      createdAt
      imageUrl
      mintAddress
      name
      symbol
    }
  }
`;

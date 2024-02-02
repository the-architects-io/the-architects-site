import { gql } from "@apollo/client";

export const ADD_TOKENS_DEPRECATED = gql`
  mutation ADD_TOKENS_DEPRECATED(
    $decimals: Int!
    $imageUrl: String!
    $mintAddress: String!
    $name: String!
    $symbol: String!
  ) {
    insert_tokens_one_deprecated(
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

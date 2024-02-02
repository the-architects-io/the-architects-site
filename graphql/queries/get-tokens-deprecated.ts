import { gql } from "@apollo/client";

export const GET_TOKENS_DEPRECATED = gql`
  query GET_TOKENS_DEPRECATED {
    tokens_deprecated(order_by: { createdAt: desc }) {
      id
      createdAt
      decimals
      imageUrl
      mintAddress
      name
      symbol
      items {
        id
        name
      }
      mounts {
        id
        name
      }
      nftCollection {
        id
        name
      }
      isFungible
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_TOKEN_BY_MINT_ADDRESS_DEPRECATED = gql`
  query GET_TOKEN_BY_MINT_ADDRESS_DEPRECATED($mintAddress: String!) {
    tokens_deprecated(where: { mintAddress: { _eq: $mintAddress } }) {
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
      nftCollection {
        id
        name
      }
      isFungible
    }
  }
`;

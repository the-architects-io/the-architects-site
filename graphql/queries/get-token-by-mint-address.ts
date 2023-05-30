import { gql } from "@apollo/client";

export const GET_TOKEN_BY_MINT_ADDRESS = gql`
  query GET_TOKEN_BY_MINT_ADDRESS($mintAddress: String!) {
    tokens(where: { mintAddress: { _eq: $mintAddress } }) {
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

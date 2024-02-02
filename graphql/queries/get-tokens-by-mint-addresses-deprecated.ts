import { gql } from "@apollo/client";

export const GET_TOKENS_BY_MINT_ADDRESSES_DEPRECATED = gql`
  query GET_TOKENS_BY_MINT_ADDRESSES_DEPRECATED($mintAddresses: [String!]!) {
    tokens_deprecated(where: { mintAddress: { _in: $mintAddresses } }) {
      name
      imageUrl
      id
      decimals
      mintAddress
      lastClaim {
        id
        createdAt
      }
    }
  }
`;

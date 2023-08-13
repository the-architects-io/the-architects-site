import { gql } from "@apollo/client";

export const GET_TOKENS_BY_MINT_ADDRESSES = gql`
  query GET_TOKENS_BY_MINT_ADDRESSES($mintAddresses: [String!]!) {
    tokens(where: { mintAddress: { _in: $mintAddresses } }) {
      id
      decimals
      lastClaim {
        id
        createdAt
      }
    }
  }
`;

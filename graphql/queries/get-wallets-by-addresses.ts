import { gql } from "@apollo/client";

export const GET_WALLETS_BY_ADDRESSES = gql`
  query GET_WALLETS_BY_ADDRESSES($addresses: [String!]!) {
    wallets(where: { address: { _in: $addresses } }) {
      address
      id
    }
  }
`;

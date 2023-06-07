import { gql } from "@apollo/client";

export const ADD_WALLET = gql`
  mutation ADD_WALLET($address: String!) {
    insert_wallets_one(object: { address: $address }) {
      address
      id
    }
  }
`;

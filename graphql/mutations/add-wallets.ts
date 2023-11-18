import { gql } from "@apollo/client";

export const ADD_WALLETS = gql`
  mutation ADD_WALLETS($wallets: [wallets_insert_input!]!) {
    insert_wallets(objects: $wallets) {
      affected_rows
      returning {
        address
        id
      }
    }
  }
`;

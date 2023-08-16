import { gql } from "@apollo/client";

export const ADD_WALLET_WITH_USER = gql`
  mutation ADD_WALLET_WITH_USER($walletAddress: String!, $userId: uuid!) {
    insert_wallets_one(object: { address: $walletAddress, userId: $userId }) {
      address
      id
    }
  }
`;

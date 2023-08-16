import { gql } from "@apollo/client";

export const BIND_USER_TO_WALLET = gql`
  mutation BIND_USER_TO_WALLET($walletId: uuid!, $userId: uuid!) {
    update_wallets_by_pk(
      pk_columns: { id: $walletId }
      _set: { userId: $userId }
    ) {
      id
    }
  }
`;

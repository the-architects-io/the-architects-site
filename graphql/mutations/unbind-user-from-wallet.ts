import { gql } from "@apollo/client";

export const UNBIND_USER_FROM_WALLET = gql`
  mutation UNBIND_USER_FROM_WALLET($address: String!) {
    update_wallets(
      where: { address: { _eq: $address } }
      _set: { userId: null }
    ) {
      affected_rows
    }
  }
`;

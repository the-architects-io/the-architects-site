import { gql } from "@apollo/client";

export const UPDATE_USER = gql`
  mutation UPDATE_USER($id: uuid!, $setInput: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: $setInput) {
      accounts {
        id
        email
        provider {
          id
          name
        }
      }
      email
      id
      imageUrl
      name
      primaryWallet {
        address
        id
      }
      wallets {
        id
        address
      }
    }
  }
`;

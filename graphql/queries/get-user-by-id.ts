import { gql } from "@apollo/client";

export const GET_USER_BY_ID = gql`
  query GET_USER_BY_ID($id: uuid!) {
    users_by_pk(id: $id) {
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

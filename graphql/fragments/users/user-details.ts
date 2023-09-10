import { gql } from "@apollo/client";

export const USER_DETAILS = gql`
  fragment UserDetails on User{
      id
      name
      email
      createdAt
      wallets {
        id
        address
      }
      primaryWallet {
        id
        address
      }
      accounts {
        id
        provider {
          id
          name
        }
        createdAt
        imageUrl
        username
        email
      }
      imageUrl
    }
  }
`;

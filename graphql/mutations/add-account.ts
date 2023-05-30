import { gql } from "@apollo/client";

export const ADD_ACCOUNT = gql`
  mutation ADD_ACCOUNT(
    $email: String = ""
    $imageUrl: String = ""
    $providerId: uuid!
    $providerAccountId: String = ""
    $username: String = ""
    $userId: uuid!
    $tokenType: String = ""
    $accessToken: String = ""
  ) {
    insert_accounts_one(
      object: {
        email: $email
        imageUrl: $imageUrl
        providerId: $providerId
        providerAccountId: $providerAccountId
        username: $username
        userId: $userId
        tokenType: $tokenType
        accessToken: $accessToken
      }
    ) {
      id
      email
      imageUrl
      provider {
        name
        id
      }
      username
      user {
        email
        id
        name
        imageUrl
      }
    }
  }
`;

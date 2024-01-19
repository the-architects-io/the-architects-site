import { gql } from "@apollo/client";

export const GET_INVITE_CODE_BY_USER_ID = gql`
  query GET_INVITE_CODE_BY_USER_ID($userId: uuid!) {
    inviteCodes(where: { userId: { _eq: $userId } }) {
      code
      id
      createdAt
      user {
        id
      }
      updatedAt
    }
  }
`;

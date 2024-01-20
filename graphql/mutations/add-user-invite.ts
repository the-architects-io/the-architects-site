import { gql } from "@apollo/client";

export const ADD_USER_INVITE = gql`
  mutation ADD_USER_INVITE($userId: uuid!, $invitedUserId: uuid!) {
    insert_userInvites_one(
      object: { userId: $userId, invitedUserId: $invitedUserId }
    ) {
      id
      createdAt
      updatedAt
      user {
        id
      }
      invitedUser {
        id
      }
    }
  }
`;

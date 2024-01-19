import { gql } from "@apollo/client";

export const ADD_INVITE_CODE = gql`
  mutation ADD_INVITE_CODE($userId: uuid!, $code: String!) {
    insert_inviteCodes_one(object: { code: $code, userId: $userId }) {
      code
      id
      user {
        id
      }
      createdAt
      updatedAt
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_USER_INVITES_COUNT = gql`
  query GET_USER_INVITES_COUNT($userId: uuid!) {
    userInvites_aggregate(where: { userId: { _eq: $userId } }) {
      aggregate {
        count
      }
    }
  }
`;

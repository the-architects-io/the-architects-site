import { gql } from "@apollo/client";

export const GET_USER_INVITE_COUNTS = gql`
  query GET_USER_INVITE_COUNTS {
    users(order_by: { invitedUserInvites_aggregate: { count: desc } }) {
      invitedUserInvites_aggregate {
        aggregate {
          count
        }
      }
      id
      email
      displayName
    }
  }
`;

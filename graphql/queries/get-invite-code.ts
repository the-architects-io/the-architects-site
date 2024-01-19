import { gql } from "@apollo/client";

export const GET_INVITE_CODE = gql`
  query GET_INVITE_CODE($code: String!) {
    inviteCodes(where: { code: { _eq: $code } }) {
      id
      code
      createdAt
      user {
        id
      }
    }
  }
`;

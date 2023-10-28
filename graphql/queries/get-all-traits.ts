import { gql } from "@apollo/client";

export const GET_ALL_TRAITS = gql`
  query MyQuery {
    traits {
      id
      name
      createdAt
    }
  }
`;

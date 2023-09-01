import { gql } from "@apollo/client";

export const GET_DISPENSERS = gql`
  query GET_DISPENSERS {
    dispensers {
      id
      name
      createdAt
      description
      isEnabled
      imageUrl
    }
  }
`;

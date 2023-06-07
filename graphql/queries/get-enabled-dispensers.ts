import { gql } from "@apollo/client";

export const GET_ENABLED_DISPENSERS = gql`
  query GET_ENABLED_DISPENSERS {
    dispensers(where: { isEnabled: { _eq: true } }) {
      id
      name
      createdAt
      description
      isEnabled
      imageUrl
      rarity {
        id
        name
      }
    }
  }
`;

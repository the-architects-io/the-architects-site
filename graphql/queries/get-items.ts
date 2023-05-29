import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
  query GET_ITEMS {
    items {
      createdAt
      id
      imageUrl
      isConsumable
      isCraftable
      name
      category {
        id
        name
      }
      token {
        id
        name
        mintAddress
      }
    }
  }
`;

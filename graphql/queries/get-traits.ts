import { gql } from "@apollo/client";

export const GET_TRAITS = gql`
  query GET_TRAITS {
    items(
      where: {
        category: {
          parentCategory: {
            id: { _eq: "917e04f7-11fa-444c-8b9c-f34bf7d0db17" }
          }
        }
      }
    ) {
      rarity {
        id
        name
      }
      createdAt
      description
      id
      imageUrl
      category {
        id
        name
      }
      name
      token {
        id
        mintAddress
      }
    }
  }
`;

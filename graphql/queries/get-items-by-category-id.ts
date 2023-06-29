import { gql } from "@apollo/client";

export const GET_ITEMS_BY_CATEGORY_ID = gql`
  query GET_ITEMS_BY_CATEGORY_ID($itemCategoryId: uuid!) {
    items(where: { itemCategoryId: { _eq: $itemCategoryId } }) {
      description
      id
      imageUrl
      isConsumable
      isCraftable
      name
      rarity {
        id
        name
        createdAt
      }
      updatedAt
      token {
        decimals
        id
        imageUrl
        mintAddress
        name
        symbol
      }
    }
  }
`;

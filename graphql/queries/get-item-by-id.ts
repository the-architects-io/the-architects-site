import { gql } from "@apollo/client";

export const GET_ITEM_BY_ID = gql`
  query GET_ITEM_BY_ID($id: uuid!) {
    items_by_pk(id: $id) {
      description
      rarity {
        id
        name
      }
      imageUrl
      id
      isConsumable
      isCraftable
      name
      category {
        id
        name
        parentCategory {
          name
          id
        }
        childCategories {
          id
          name
        }
      }
      collections {
        name
        id
        imageUrl
      }
      token {
        id
        mintAddress
      }
    }
  }
`;

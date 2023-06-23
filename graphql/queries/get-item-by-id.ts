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
      itemCategory {
        id
        name
        parentItemCategory {
          name
          id
        }
        childItemCategories {
          id
          name
        }
      }
      itemCollections {
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

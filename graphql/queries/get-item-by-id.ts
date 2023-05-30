import { gql } from "@apollo/client";

export const GET_ITEM_BY_ID = gql`
  query GET_ITEM_BY_ID($id: uuid!) {
    items_by_pk(id: $id) {
      description
      rarity {
        id
        name
      }
      baseStatModifier {
        id
        name
        effectAmount
        affectedBaseStat {
          name
          id
          max
          min
        }
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

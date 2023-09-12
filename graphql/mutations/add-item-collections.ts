import { gql } from "@apollo/client";

export const ADD_ITEM_COLLECTIONS = gql`
  mutation ADD_ITEM_COLLECTIONS(
    $itemCollections: [itemCollections_insert_input!]!
  ) {
    insert_itemCollections(objects: $itemCollections) {
      affected_rows
      returning {
        amount
        id
        imageUrl
        name
        item {
          id
          name
          token {
            id
            mintAddress
          }
        }
      }
    }
  }
`;

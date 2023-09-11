import { gql } from "@apollo/client";

export const ADD_ITEMS = gql`
  mutation ADD_ITEMS($items: [items_insert_input!] = {}) {
    insert_items(objects: $items) {
      affected_rows
      returning {
        id
        name
        token {
          id
          name
          mintAddress
        }
      }
    }
  }
`;

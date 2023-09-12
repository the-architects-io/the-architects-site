import { gql } from "@apollo/client";

export const ADD_COST_COLLECTIONS = gql`
  mutation ADD_COST_COLLECTIONS(
    $costCollections: [costCollections_insert_input!] = {}
  ) {
    insert_costCollections(objects: $costCollections) {
      affected_rows
      returning {
        id
        name
      }
    }
  }
`;

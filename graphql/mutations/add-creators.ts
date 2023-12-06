import { gql } from "@apollo/client";

export const ADD_CREATORS = gql`
  mutation ADD_CREATORS($creators: [creators_insert_input!]!) {
    insert_creators(objects: $creators) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

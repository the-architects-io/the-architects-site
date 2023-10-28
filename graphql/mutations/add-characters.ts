import { gql } from "@apollo/client";

export const ADD_CHARACTERS = gql`
  mutation ADD_CHARACTERS($characters: [characters_insert_input!]!) {
    insert_characters(objects: $characters) {
      affected_rows
      returning {
        id
        createdAt
        token {
          id
          name
          mintAddress
        }
        name
      }
    }
  }
`;

import { gql } from "@apollo/client";

export const ADD_TRAITS = gql`
  mutation ADD_TRAITS($traits: [traits_insert_input!]!) {
    insert_traits(objects: $traits) {
      affected_rows
      returning {
        id
        name
        createdAt
        nftCollection {
          id
          name
        }
      }
    }
  }
`;

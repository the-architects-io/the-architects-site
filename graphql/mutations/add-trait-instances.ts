import { gql } from "@apollo/client";

export const ADD_TRAIT_INSTANCES = gql`
  mutation ADD_TRAIT_INSTANCES(
    $traitInstances: [traitInstances_insert_input!]!
  ) {
    insert_traitInstances(objects: $traitInstances) {
      affected_rows
      returning {
        id
        value
        trait {
          id
          name
        }
        createdAt
      }
    }
  }
`;

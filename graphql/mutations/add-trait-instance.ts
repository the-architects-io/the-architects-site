import { gql } from "@apollo/client";

export const ADD_TRAIT_INSTANCE = gql`
  mutation ADD_TRAIT_INSTANCE(
    $traitId: uuid!
    $creatureId: uuid!
    $value: String!
  ) {
    insert_traitInstances_one(
      object: { traitId: $traitId, creatureId: $creatureId, value: $value }
    ) {
      id
      trait {
        id
        name
      }
      creature {
        id
        name
      }
    }
  }
`;

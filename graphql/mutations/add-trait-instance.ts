import { gql } from "@apollo/client";

export const ADD_TRAIT_INSTANCE = gql`
  mutation ADD_TRAIT_INSTANCE(
    $traitId: uuid!
    $characterId: uuid!
    $value: String!
  ) {
    insert_traitInstances_one(
      object: { traitId: $traitId, characterId: $characterId, value: $value }
    ) {
      id
      trait {
        id
        name
      }
      character {
        id
        name
      }
    }
  }
`;

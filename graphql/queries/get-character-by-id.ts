import { gql } from "@apollo/client";

export const GET_CHARACTER_BY_ID = gql`
  query GET_CHARACTER_BY_ID($id: uuid!) {
    characters_by_pk(id: $id) {
      name
      id
      imageUrl
      rarity {
        name
        id
      }
      traitCombinationHash
      mainCharacterActivityInstances {
        id
        payoutId
        isComplete
      }
      token {
        id
        name
        mintAddress
      }
      traitInstances {
        trait {
          id
          name
        }
        id
        value
      }
    }
  }
`;

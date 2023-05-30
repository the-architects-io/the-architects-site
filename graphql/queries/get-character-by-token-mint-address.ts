import { gql } from "@apollo/client";

export const GET_CHARACTER_BY_TOKEN_MINT_ADDRESS = gql`
  query GET_CHARACTER_BY_TOKEN_MINT_ADDRESS($mintAddress: String!) {
    characters(where: { token: { mintAddress: { _eq: $mintAddress } } }) {
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

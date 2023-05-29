import { gql } from "@apollo/client";

export const GET_CREATURE_BY_TOKEN_MINT_ADDRESS = gql`
  query GET_CREATURE_BY_TOKEN_MINT_ADDRESS($mintAddress: String!) {
    creatures(where: { token: { mintAddress: { _eq: $mintAddress } } }) {
      name
      id
      creatureCollections {
        name
        id
      }
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

import { gql } from "@apollo/client";

export const GET_CHARACTERS_BY_TOKEN_MINT_ADDRESSES = gql`
  query GET_CHARACTERS_BY_TOKEN_MINT_ADDRESSS($mintAddresses: [String!]!) {
    characters(where: { token: { mintAddress: { _in: $mintAddresses } } }) {
      name
      id
      imageUrl
      token {
        id
        mintAddress
      }
      traitInstances {
        trait {
          name
          id
        }
        id
        value
      }
      mainCharacterActivityInstances {
        id
        startTime
        endTime
        isComplete
        activity {
          id
          startTime
          endTime
        }
      }
    }
  }
`;

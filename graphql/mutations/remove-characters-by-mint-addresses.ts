import { gql } from "@apollo/client";

export const REMOVE_CHARACTERS_BY_MINT_ADDRESSES = gql`
  mutation REMOVE_CHARACTERS_BY_MINT_ADDRESSES($mintAddresses: [String!]!) {
    delete_characters(
      where: { token: { mintAddress: { _in: $mintAddresses } } }
    ) {
      affected_rows
      returning {
        id
        name
      }
    }
  }
`;

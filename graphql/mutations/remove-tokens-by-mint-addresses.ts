import { gql } from "@apollo/client";

export const REMOVE_TOKENS_BY_MINT_ADDRESSES = gql`
  mutation REMOVE_TOKENS_BY_MINT_ADDRESSES($mintAddresses: [String!]!) {
    delete_tokens(where: { mintAddress: { _in: $mintAddresses } }) {
      affected_rows
      returning {
        id
        name
        mintAddress
      }
    }
  }
`;

import { gql } from "@apollo/client";

export const REMOVE_TOKENS_BY_MINT_ADDRESSES_DEPRECATED = gql`
  mutation REMOVE_TOKENS_BY_MINT_ADDRESSES_DEPRECATED(
    $mintAddresses: [String!]!
  ) {
    delete_tokens_deprecated(where: { mintAddress: { _in: $mintAddresses } }) {
      affected_rows
      returning {
        id
        name
        mintAddress
      }
    }
  }
`;

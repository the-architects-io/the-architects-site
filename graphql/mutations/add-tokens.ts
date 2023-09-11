import { gql } from "@apollo/client";

export const ADD_TOKENS = gql`
  mutation ADD_TOKENS($tokens: [tokens_insert_input!] = {}) {
    insert_tokens(objects: $tokens) {
      affected_rows
      returning {
        id
        decimals
        name
        mintAddress
      }
    }
  }
`;

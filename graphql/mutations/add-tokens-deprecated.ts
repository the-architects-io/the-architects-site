import { gql } from "@apollo/client";

export const ADD_TOKENS_DEPRECATED = gql`
  mutation ADD_TOKENS_DEPRECATED($tokens: [tokens_insert_input!] = {}) {
    insert_tokens_deprecated(objects: $tokens) {
      affected_rows
      returning {
        id
        decimals
        name
        mintAddress
        imageUrl
      }
    }
  }
`;

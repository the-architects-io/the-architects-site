import { gql } from "@apollo/client";

export const GET_ITEMS_BY_TOKEN_IDS = gql`
  query GET_ITEMS_BY_TOKEN_IDS($ids: [uuid!] = "") {
    items(where: { tokenId: { _in: $ids } }) {
      id
      name
      token {
        id
        mintAddress
        name
        symbol
        imageUrl
      }
      description
    }
  }
`;

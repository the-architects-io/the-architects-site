import { gql } from "@apollo/client";

export const BIND_ITEM_TO_TOKEN = gql`
  mutation BIND_ITEM_TO_TOKEN($itemId: uuid!, $tokenId: uuid!) {
    update_items_by_pk(
      pk_columns: { id: $itemId }
      _set: { tokenId: $tokenId }
    ) {
      id
      token {
        id
        mintAddress
      }
    }
  }
`;

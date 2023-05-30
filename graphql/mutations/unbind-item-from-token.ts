import { gql } from "@apollo/client";

export const UNBIND_ITEM_FROM_TOKEN = gql`
  mutation UNBIND_ITEM_FROM_TOKEN($id: uuid!) {
    update_items_by_pk(pk_columns: { id: $id }, _set: { tokenId: null }) {
      id
      name
      token {
        id
        mintAddress
      }
    }
  }
`;

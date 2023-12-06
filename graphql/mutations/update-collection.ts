import { gql } from "@apollo/client";

export const UPDATE_COLLECTION = gql`
  mutation UPDATE_COLLECTION($id: uuid!, $collection: collections_set_input!) {
    update_collections_by_pk(pk_columns: { id: $id }, _set: $collection) {
      id
      name
    }
  }
`;

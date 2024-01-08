import { gql } from "@apollo/client";

export const UPDATE_MERKLE_TREE = gql`
  mutation UPDATE_MERKLE_TREE($id: uuid!, $merkleTree: merkleTrees_set_input!) {
    update_merkleTrees_by_pk(pk_columns: { id: $id }, _set: $merkleTree) {
      address
      cluster
      id
      user {
        id
      }
      updatedAt
      maxDepth
      maxCapacity
      maxBufferSize
      createdAt
      currentCapacity
    }
  }
`;

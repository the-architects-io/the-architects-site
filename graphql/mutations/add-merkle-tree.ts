import { gql } from "graphql-request";

export const ADD_MERKLE_TREE = gql`
  mutation ADD_MERKLE_TREE($tree: merkle_trees_insert_input!) {
    insert_merkle_trees_one(object: $tree) {
      address
      createdAt
      id
      maxBufferSize
      maxDepth
      updatedAt
    }
  }
`;

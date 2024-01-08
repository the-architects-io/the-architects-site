import { gql } from "graphql-request";

export const ADD_MERKLE_TREE = gql`
  mutation ADD_MERKLE_TREE($tree: merkleTrees_insert_input!) {
    insert_merkleTrees_one(object: $tree) {
      address
      createdAt
      id
      maxBufferSize
      maxDepth
      updatedAt
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_MERKLE_TREE_BY_ID = gql`
  query GET_MERKLE_TREE_BY_ID($id: uuid!) {
    merkleTrees_by_pk(id: $id) {
      user {
        id
      }
      updatedAt
      maxDepth
      maxBufferSize
      createdAt
      address
      id
      maxCapacity
      currentCapacity
      cluster
    }
  }
`;

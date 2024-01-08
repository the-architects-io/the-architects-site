import { gql } from "@apollo/client";

export const GET_MERKLE_TREES_BY_USER_ID = gql`
  query GET_MERKLE_TREES_BY_USER_ID($userId: uuid!) {
    merkleTrees(
      where: { userId: { _eq: $userId } }
      order_by: { createdAt: desc }
    ) {
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

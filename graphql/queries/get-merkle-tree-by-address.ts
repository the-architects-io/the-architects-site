import { gql } from "@apollo/client";

export const GET_MERKLE_TREE_BY_ADDRESS = gql`
  query GET_MERKLE_TREE_BY_ADDRESS($address: String!) {
    merkleTrees(where: { address: { _eq: $address } }) {
      address
      cluster
      createdAt
      currentCapacity
      id
      maxBufferSize
      maxCapacity
      maxDepth
      updatedAt
      user {
        id
      }
    }
  }
`;

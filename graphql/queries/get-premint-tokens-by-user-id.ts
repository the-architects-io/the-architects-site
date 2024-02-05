import { gql } from "@apollo/client";

export const GET_PREMINT_TOKENS_BY_USER_ID = gql`
  query GET_PREMINT_TOKENS_BY_USER_ID($userId: uuid!) {
    tokens(where: { userId: { _eq: $userId }, isPremint: { _eq: true } }) {
      id
      amountToMint
      attributes
      animation_url
      cluster
      createdAt
      creators
      description
      external_url
      image
      isPremint
      merkleTreeId
      mintAddress
      name
      properties
      seller_fee_basis_points
      symbol
      updatedAt
      userId
    }
  }
`;

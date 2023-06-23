import { gql } from "@apollo/client";

export const GET_PAYOUTS_BY_CHARACTER_ID = gql`
  query GET_PAYOUTS_BY_CHARACTER_ID($id: uuid!) {
    payouts(
      where: { activityInstances: { mainCharacterId: { _eq: $id } } }
      order_by: { createdAt: desc }
    ) {
      amount
      id
      createdAt
      txAddress
      token {
        id
        name
        mintAddress
        items {
          id
          name
          imageUrl
        }
        imageUrl
        characters {
          id
          name
          imageUrl
        }
      }
    }
  }
`;

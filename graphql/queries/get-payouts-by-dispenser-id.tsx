import { gql } from "@apollo/client";

export const GET_PAYOUTS_BY_DISPENSER_ID = gql`
  query GET_PAYOUTS_BY_DISPENSER_ID($id: uuid!) {
    payouts(
      where: { dispenserId: { _eq: $id } }
      order_by: { createdAt: desc }
    ) {
      id
      amount
      txAddress
      dispenser {
        name
        id
      }
      name
      item {
        id
        name
      }
      token {
        name
        id
        mintAddress
        items {
          id
          name
          imageUrl
        }
      }
      wallet {
        id
        address
      }
    }
  }
`;

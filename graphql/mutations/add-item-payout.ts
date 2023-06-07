import { gql } from "@apollo/client";

export const ADD_ITEM_PAYOUT = gql`
  mutation ADD_ITEM_PAYOUT(
    $txAddress: String = ""
    $amount: numeric!
    $itemId: uuid!
    $tokenId: uuid!
    $dispenserId: uuid!
  ) {
    insert_payouts_one(
      object: {
        txAddress: $txAddress
        amount: $amount
        itemId: $itemId
        tokenId: $tokenId
        dispenserId: $dispenserId
      }
    ) {
      id
      txAddress
      amount
      token {
        id
        name
        mintAddress
      }
    }
  }
`;

import { gql } from "@apollo/client";

export const ADD_ITEM_PAYOUT = gql`
  mutation ADD_ITEM_PAYOUT(
    $txAddress: String = ""
    $amount: numeric!
    $itemId: uuid = null
    $tokenId: uuid!
    $dispenserId: uuid!
    $walletId: uuid!
  ) {
    insert_payouts_one(
      object: {
        txAddress: $txAddress
        amount: $amount
        itemId: $itemId
        tokenId: $tokenId
        dispenserId: $dispenserId
        walletId: $walletId
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

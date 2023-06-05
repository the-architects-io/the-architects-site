import { gql } from "@apollo/client";

export const ADD_ITEM_REWARD_COLLECTION = gql`
  mutation ADD_ITEM_REWARD_COLLECTION(
    $dispenserId: uuid!
    $isFreezeOnDelivery: Boolean = false
    $imageUrl: String!
    $name: String!
    $payoutChance: numeric!
    $itemCollectionId: uuid!
  ) {
    insert_rewardCollections_one(
      object: {
        dispenserId: $dispenserId
        isFreezeOnDelivery: $isFreezeOnDelivery
        imageUrl: $imageUrl
        name: $name
        payoutChance: $payoutChance
        itemCollectionId: $itemCollectionId
      }
    ) {
      id
      name
      createdAt
    }
  }
`;

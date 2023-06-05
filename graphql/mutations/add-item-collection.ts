import { gql } from "@apollo/client";

export const ADD_ITEM_COLLECTION = gql`
  mutation ADD_ITEM_COLLECTION(
    $amount: numeric!
    $itemId: uuid!
    $name: String!
    $imageUrl: String!
  ) {
    insert_itemCollections_one(
      object: {
        amount: $amount
        itemId: $itemId
        name: $name
        imageUrl: $imageUrl
      }
    ) {
      id
      createdAt
      name
      amount
    }
  }
`;

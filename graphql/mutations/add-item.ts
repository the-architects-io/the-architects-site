import { gql } from "@apollo/client";

export const ADD_ITEM = gql`
  mutation ADD_ITEM(
    $imageUrl: String = ""
    $isConsumable: Boolean!
    $isCraftable: Boolean!
    $categoryId: uuid!
    $name: String!
    $description: String = ""
  ) {
    insert_items_one(
      object: {
        imageUrl: $imageUrl
        isConsumable: $isConsumable
        isCraftable: $isCraftable
        categoryId: $categoryId
        name: $name
        description: $description
      }
    ) {
      id
      imageUrl
      isConsumable
      isCraftable
      description
      category {
        id
        name
      }
      name
    }
  }
`;

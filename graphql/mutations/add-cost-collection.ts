import { gql } from "@apollo/client";

export const ADD_COST_COLLECTION = gql`
  mutation ADD_COST_COLLECTION(
    $itemCollectionId: uuid!
    $dispenserId: uuid!
    $name: String!
  ) {
    insert_costCollections_one(
      object: {
        itemCollectionId: $itemCollectionId
        dispenserId: $dispenserId
        name: $name
      }
    ) {
      id
      name
    }
  }
`;

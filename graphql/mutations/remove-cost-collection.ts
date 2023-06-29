import { gql } from "@apollo/client";

export const REMOVE_COST_COLLECTION = gql`
  mutation REMOVE_COST_COLLECTION($costCollectionId: uuid!) {
    delete_costCollections_by_pk(id: $costCollectionId) {
      id
    }
  }
`;

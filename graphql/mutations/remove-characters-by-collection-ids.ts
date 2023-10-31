import { gql } from "@apollo/client";

export const REMOVE_CHARACTERS_BY_COLLECTION_IDS = gql`
  mutation REMOVE_CHARACTERS_BY_COLLECTION_IDS($_eq: uuid!) {
    delete_characters(where: { nftCollectionId: { _eq: $_eq } }) {
      affected_rows
      returning {
        id
        name
      }
    }
  }
`;

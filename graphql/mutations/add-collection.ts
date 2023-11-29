import { gql } from "@apollo/client";

export const ADD_COLLECTION = gql`
  mutation ADD_COLLECTION($collection: collections_insert_input = {}) {
    insert_collections_one(object: $collection) {
      id
      owner {
        id
      }
      nft {
        creators {
          id
          share
          wallet {
            address
            id
          }
          token {
            id
            mintAddress
          }
        }
      }
    }
  }
`;

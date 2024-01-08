import { gql } from "@apollo/client";

export const GET_COLLECTION_BY_ID = gql`
  query GET_COLLECTION_BY_ID($id: uuid!) {
    collections_by_pk(id: $id) {
      id
      creators {
        id
        share
        sortOrder
        wallet {
          id
          address
          user {
            id
            displayName
          }
        }
      }
      collectionNftAddress
      # merkleTree {
      #   id
      #   address
      #   maxDepth
      #   maxBufferSize
      # }
      createdAt
      family
      driveAddress
      description
      hasBeenMinted
      imageUrl
      isReadyToMint
      name
      owner {
        id
      }
      sellerFeeBasisPoints
      symbol
      updatedAt
      uploadJob {
        id
        status {
          id
          name
        }
        sizeInBytes
        driveAddress
        percentComplete
        log
        statusText
        fileCount
      }
    }
  }
`;

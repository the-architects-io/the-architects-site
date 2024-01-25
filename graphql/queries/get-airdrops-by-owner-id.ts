import { gql } from "@apollo/client";

export const GET_AIRDROPS_BY_OWNER_ID = gql`
  query GET_AIRDROPS_BY_OWNER_ID($id: uuid!) {
    airdrops(where: { ownerId: { _eq: $id } }) {
      id
      name
      collectionNft {
        id
        mintAddress
        name
        symbol
      }
      job {
        id
        status {
          id
          name
        }
        statusText
      }
      collection {
        maxBufferSize
        maxDepth
        canopyDepth
        id
        name
        imageUrl
        description
        symbol
        hasBeenMinted
      }
      isReadyToDrop
      startTime
      cluster
      recipients_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

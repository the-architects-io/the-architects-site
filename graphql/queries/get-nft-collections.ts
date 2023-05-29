import { gql } from "@apollo/client";

export const GET_NFT_COLLECTIONS = gql`
  query GET_NFT_COLLECTIONS {
    nftCollections {
      name
      imageUrl
      id
      firstVerifiedCreator
      createdAt
      associatedCommunity {
        id
        name
        imageUrl
      }
      verifiedCollectionAddress
    }
  }
`;

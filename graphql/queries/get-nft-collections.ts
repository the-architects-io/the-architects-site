import { gql } from "@apollo/client";

export const GET_NFT_COLLECTIONS = gql`
  query GET_NFT_COLLECTIONS {
    nftCollections {
      createdAt
      community {
        id
        name
        imageUrl
      }
      firstVerifiedCreator
      id
      imageUrl
      name
      updatedAt
      verifiedCollectionAddress
    }
  }
`;

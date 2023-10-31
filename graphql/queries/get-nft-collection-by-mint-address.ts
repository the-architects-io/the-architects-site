import { gql } from "@apollo/client";

export const GET_NFT_COLLECTION_BY_MINT_ADDRESS = gql`
  query GET_NFT_COLLECTION_BY_MINT_ADDRESS($mintAddress: String!) {
    nftCollections(where: { mintAddress: { _eq: $mintAddress } }) {
      id
      name
      mintAddress
      createdAt
      firstVerifiedCreator
      imageUrl
    }
  }
`;

import { gql } from "@apollo/client";

export const ADD_AIRDROP = gql`
  mutation ADD_AIRDROP($airdrop: airdrops_insert_input!) {
    insert_airdrops_one(object: $airdrop) {
      name
      id
      collectionNft {
        id
        name
        mintAddress
      }
    }
  }
`;

import { gql } from "@apollo/client";

export const UPDATE_AIRDROP = gql`
  mutation UPDATE_AIRDROP($id: uuid!, $airdrop: airdrops_set_input!) {
    update_airdrops_by_pk(pk_columns: { id: $id }, _set: $airdrop) {
      collection {
        id
        name
        imageUrl
        createdAt
      }
      collectionNft {
        id
      }
      id
      createdAt
      isReadyToDrop
      name
      owner {
        id
      }
      recipients {
        id
        amount
      }
      updatedAt
    }
  }
`;

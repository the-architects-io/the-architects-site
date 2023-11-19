import { gql } from "@apollo/client";

export const GET_AIRDROP_BY_ID = gql`
  query GET_AIRDROP_BY_ID($id: uuid!) {
    airdrops_by_pk(id: $id) {
      id
      name
      owner {
        id
      }
      recipients {
        id
        amount
        wallet {
          address
          id
        }
      }
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_COST_COLLECTIONS_BY_DISPENSER_ID = gql`
  query GET_COST_COLLECTIONS_BY_DISPENSER_ID($id: uuid!) {
    costCollections(where: { dispenserId: { _eq: $id } }) {
      id
      name
      itemCollection {
        id
        amount
        name
        item {
          id
        }
      }
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_ITEMS_BY_IDS = gql`
  query GET_ITEMS_BY_IDS($ids: [uuid!]!) {
    items(where: { id: { _in: $ids } }) {
      id
      name
      imageUrl
      token {
        id
      }
    }
  }
`;

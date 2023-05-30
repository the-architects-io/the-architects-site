import { gql } from "@apollo/client";

export const GET_ITEM_CATEGORIES = gql`
  query GET_ITEM_CATEGORIES {
    itemCategories(order_by: { name: desc }) {
      id
      name
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_REWARD_CATEGORIES = gql`
  query GET_REWARD_CATEGORIES {
    rewardCategories {
      id
      name
    }
  }
`;

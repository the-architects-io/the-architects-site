import { gql } from "@apollo/client";

export const GET_DISPENSER_REWARD_DISPLAY_TYPES = gql`
  query GET_DISPENSER_REWARD_DISPLAY_TYPES {
    rewardDisplayTypes {
      id
      name
      label
    }
  }
`;

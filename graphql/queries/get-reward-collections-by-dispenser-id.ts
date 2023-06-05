import { gql } from "@apollo/client";

export const GET_REWARD_COLLECTIONS_BY_DISPENSER_ID = gql`
  query GET_REWARD_COLLECTIONS_BY_DISPENSER_ID($id: uuid!) {
    rewardCollections(where: { dispenserId: { _eq: $id } }) {
      createdAt
      id
      name
      parentRewardCollection {
        name
        createdAt
      }
      itemCollection {
        id
        amount
        imageUrl
        name
        item {
          imageUrl
          id
          name
        }
      }
      payoutChance
      imageUrl
    }
  }
`;

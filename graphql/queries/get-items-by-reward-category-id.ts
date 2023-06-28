import { gql } from "@apollo/client";

export const GET_ITEMS_BY_REWARD_CATEGORY_ID = gql`
  query GET_ITEMS_BY_REWARD_CATEGORY_ID($rewardCategoryId: uuid!) {
    items(
      where: { itemCategory: { rewardCategoryId: { _eq: $rewardCategoryId } } }
    ) {
      description
      id
      imageUrl
      isConsumable
      isCraftable
      name
      rarity {
        id
        name
        createdAt
      }
      updatedAt
      token {
        decimals
        id
        imageUrl
        mintAddress
        name
        symbol
      }
    }
  }
`;

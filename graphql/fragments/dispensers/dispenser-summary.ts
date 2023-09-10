import { gql } from "@apollo/client";

export const DISPENSER_SUMMARY = gql`
  fragment DispenserSummary on Dispensers {
    rewardWalletAddress
    rewardWalletBump
    collectionWallet {
      id
      address
    }
    costCollections {
      id
      name
    }
    rewardCollections {
      dispenserId
      payoutChance
      isFreezeOnDelivery
      itemCollection {
        id
        amount
        item {
          name
          id
          imageUrl
          token {
            id
            name
            mintAddress
          }
        }
      }
      id
      name
    }
    restrictionCollections {
      id
      name
    }
    gateCollections {
      id
      name
    }
    updatedAt
    createdAt
    description
    id
    name
    isEnabled
    imageUrl
    rarity {
      name
      id
    }
  }
`;

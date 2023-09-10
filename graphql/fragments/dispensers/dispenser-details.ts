import { gql } from "@apollo/client";

export const DISPENSER_DETAILS = gql`
  fragment DispenserDetails on Dispensers {
    rewardWalletAddress
    rewardWalletBump
    collectionWallet {
      id
      address
    }
    costCollections {
      dispenserId
      id
      name
      itemCollection {
        id
        name
        amount
        imageUrl
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
      childRewardCollections {
        dispenserId
        id
        hashListCollection {
          amount
          id
          hashList {
            id
            rawHashList
          }
          name
          imageUrl
        }
        imageUrl
        isFreezeOnDelivery
        name
        payoutChance
        itemCollection {
          amount
          id
          imageUrl
          name
          item {
            description
            id
            imageUrl
            isConsumable
            isCraftable
            name
            token {
              id
              name
              mintAddress
            }
          }
        }
      }
    }
    restrictionCollections {
      id
      traitCollection {
        trait {
          name
          id
        }
      }
      hashListCollection {
        id
        name
        hashList {
          id
          name
        }
      }
    }
    gateCollections {
      id
      traitCollection {
        id
        name
        trait {
          id
          name
        }
      }
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

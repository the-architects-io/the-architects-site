import { gql } from "@apollo/client";

export const GET_DISPENSER_BY_ID = gql`
  query GET_DISPENSER_BY_ID($id: uuid!) {
    dispensers_by_pk(id: $id) {
      costCollections {
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
          }
        }
      }
      rewardCollections {
        itemCollection {
          id
          amount
          item {
            id
            name
            imageUrl
            token {
              name
              mintAddress
              id
            }
          }
        }
        id
        name
      }
      restrictionCollections {
        id
        traitCollection {
          trait {
            name
            id
          }
          id
          name
        }
        hashListCollection {
          name
          hashList {
            id
            name
          }
        }
      }
      gateCollections {
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
  }
`;

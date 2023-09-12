import { gql } from "@apollo/client";

export const ADD_REWARD_COLLECTIONS = gql`
  mutation ADD_REWARD_COLLECTIONS(
    $rewardCollections: [rewardCollections_insert_input!] = {}
  ) {
    insert_rewardCollections(objects: $rewardCollections) {
      affected_rows
      returning {
        id
        name
        payoutChance
        imageUrl
        dispenser {
          id
        }
      }
    }
  }
`;

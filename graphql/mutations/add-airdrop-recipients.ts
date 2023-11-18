import { gql } from "@apollo/client";

export const ADD_AIRDROP_RECIPIENTS = gql`
  mutation ADD_AIRDROP_RECIPIENTS(
    $recipients: [airdrop_recipients_insert_input!]!
  ) {
    insert_airdrop_recipients(objects: $recipients) {
      affected_rows
      returning {
        airdrops {
          id
        }
      }
    }
  }
`;

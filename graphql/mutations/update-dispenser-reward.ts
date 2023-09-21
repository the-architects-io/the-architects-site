import { gql } from "@apollo/client";

export const UPDATE_DISPENSER_REWARD = gql`
  mutation UPDATE_DISPENSER_REWARD($payoutSortOrder: Int!, $id: uuid!) {
    update_rewardCollections_by_pk(
      pk_columns: { id: $id }
      _set: { payoutSortOrder: $payoutSortOrder }
    ) {
      name
      payoutSortOrder
      id
    }
  }
`;

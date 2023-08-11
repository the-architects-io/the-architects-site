import { gql } from "@apollo/client";

export const ADD_LAST_CLAIM_TIME = gql`
  mutation ADD_LAST_CLAIM_TIME($lastClaimId: uuid!, $tokenId: uuid!) {
    update_tokens_by_pk(
      pk_columns: { id: $tokenId }
      _set: { lastClaimId: $lastClaimId }
    ) {
      id
    }
  }
`;

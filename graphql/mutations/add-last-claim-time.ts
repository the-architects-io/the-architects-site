import { gql } from "@apollo/client";

export const ADD_LAST_CLAIM_TIMES = gql`
  mutation ADD_LAST_CLAIM_TIMES(
    $mintAddresses: [String!]!
    $lastClaimId: uuid!
  ) {
    update_tokens(
      where: { mintAddress: { _in: $mintAddresses } }
      _set: { lastClaimId: $lastClaimId }
    ) {
      affected_rows
    }
  }
`;

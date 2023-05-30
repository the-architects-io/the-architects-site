import { gql } from "@apollo/client";

export const LOG_ERROR = gql`
  mutation LOG_ERROR(
    $code: Int!
    $message: String!
    $rawError: String!
    $burnTxAddress: String = ""
  ) {
    insert_errorInstances_one(
      object: {
        code: $code
        message: $message
        rawError: $rawError
        burnTxAddress: $burnTxAddress
      }
    ) {
      code
      id
      message
      rawError
    }
  }
`;

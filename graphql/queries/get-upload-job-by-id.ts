import { gql } from "@apollo/client";

export const GET_UPLOAD_JOB_BY_ID = gql`
  query GET_UPLOAD_JOB_BY_ID($id: uuid!) {
    uploadJobs_by_pk(id: $id) {
      createdAt
      driveAddress
      id
      isComplete
      log
      percentComplete
      sizeInBytes
      updatedAt
      statusText
      status {
        id
        name
      }
      user {
        id
      }
    }
  }
`;

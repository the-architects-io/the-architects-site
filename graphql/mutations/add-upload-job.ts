import { gql } from "@apollo/client";

export const ADD_UPLOAD_JOB = gql`
  mutation ADD_UPLOAD_JOB($job: uploadJobs_insert_input!) {
    insert_uploadJobs_one(object: $job) {
      createdAt
      driveAddress
      id
      isComplete
      log
      percentComplete
      sizeInBytes
      updatedAt
      statusText
      fileCount
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

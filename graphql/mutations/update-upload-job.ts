import { gql } from "@apollo/client";

export const UPDATE_UPLOAD_JOB = gql`
  mutation UPDATE_UPLOAD_JOB($id: uuid!, $job: uploadJobs_set_input!) {
    update_uploadJobs_by_pk(pk_columns: { id: $id }, _set: $job) {
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
      icon
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

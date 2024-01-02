import { gql } from "@apollo/client";

export const ADD_JOB = gql`
  mutation ADD_JOB($job: jobs_insert_input!) {
    insert_jobs_one(object: $job) {
      createdAt
      jobTypeId
      id
      percentComplete
      statusId
      statusText
      updatedAt
      userId
    }
  }
`;

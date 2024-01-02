import { gql } from "@apollo/client";

export const UPDATE_JOB = gql`
  mutation UPDATE_JOB($id: uuid!, $job: jobs_set_input = {}) {
    update_jobs_by_pk(pk_columns: { id: $id }, _set: $job) {
      id
      jobTypeId
      createdAt
      percentComplete
      userId
      updatedAt
      statusText
      statusId
    }
  }
`;

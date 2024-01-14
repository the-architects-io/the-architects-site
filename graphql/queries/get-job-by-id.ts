import { gql } from "@apollo/client";

export const GET_JOB_BY_ID = gql`
  query GET_JOB_BY_ID($id: uuid!) {
    jobs_by_pk(id: $id) {
      createdAt
      id
      icon
      percentComplete
      status {
        name
        id
      }
      statusText
      updatedAt
      userId
      jobType {
        name
        id
      }
    }
  }
`;

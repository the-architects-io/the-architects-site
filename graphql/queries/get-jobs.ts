import { gql } from "@apollo/client";

export const GET_JOBS = gql`
  query GET_JOBS {
    jobs(order_by: { createdAt: desc }) {
      createdAt
      id
      icon
      jobType {
        id
        name
      }
      percentComplete
      status {
        id
        name
      }
      statusText
      user {
        id
        email
      }
      updatedAt
    }
  }
`;

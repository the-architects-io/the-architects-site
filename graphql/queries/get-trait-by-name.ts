import { gql } from "@apollo/client";

export const GET_TRAIT_BY_NAME = gql`
  query GET_TRAIT_BY_NAME($name: String!) {
    traits(where: { name: { _eq: $name } }) {
      id
      name
    }
  }
`;

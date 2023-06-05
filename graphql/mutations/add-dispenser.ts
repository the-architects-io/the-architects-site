import { gql } from "@apollo/client";

export const ADD_DISPENSER = gql`
  mutation ADD_DISPENSER(
    $imageUrl: String = ""
    $description: String = ""
    $name: String!
  ) {
    insert_dispensers_one(
      object: { imageUrl: $imageUrl, description: $description, name: $name }
    ) {
      name
      id
      createdAt
      description
    }
  }
`;

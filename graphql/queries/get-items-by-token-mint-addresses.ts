import { gql } from "@apollo/client";

export const GET_ITEMS_BY_TOKEN_MINT_ADDRESSES = gql`
  query GET_ITEMS_BY_TOKEN_MINT_ADDRESSES($mintAddresses: [String!]!) {
    items(where: { token: { mintAddress: { _in: $mintAddresses } } }) {
      name
      id
      imageUrl
      description
      token {
        id
        imageUrl
        name
        mintAddress
      }
    }
  }
`;

import { gql } from "@apollo/client";

export const GET_PAYOUTS = gql`
  query GET_PAYOUTS($dispenserId: uuid!, $walletAddress: String!) {
    payouts(
      where: {
        dispenserId: { _eq: $dispenserId }
        wallet: { address: { _eq: $walletAddress } }
      }
    ) {
      id
      name
      amount
      dispenser {
        id
        rewardWalletAddress
        name
        cooldownInMs
      }
      token {
        id
        decimals
        name
        mintAddress
      }
      createdAt
    }
  }
`;

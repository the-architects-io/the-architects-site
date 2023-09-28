import { gql } from "@apollo/client";

export const GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID = gql`
  query GET_DISPENSER_DISPLAYS_BY_DISPENSER_ID($id: uuid!) {
    dispenser_displays(where: { dispenserId: { _eq: $id } }) {
      backgroundColor
      claimButtonColor
      dispenser {
        id
      }
      id
      shouldDisplayDescription
      shouldDisplayImage
      shouldDisplayName
      shouldDisplayRewardsList
      textColor
    }
  }
`;

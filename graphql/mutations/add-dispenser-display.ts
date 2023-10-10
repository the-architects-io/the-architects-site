import { gql } from "@apollo/client";

export const ADD_DISPENSER_DISPLAY = gql`
  mutation ADD_DISPENSER_DISPLAY($display: dispenser_displays_insert_input!) {
    insert_dispenser_displays_one(object: $display) {
      textColor
      shouldDisplayRewards
      rewardDisplayType
      shouldDisplayName
      shouldDisplayImage
      shouldDisplayDescription
      id
      backgroundColor
      claimButtonColor
      cardWidth
      dispenser {
        id
      }
    }
  }
`;

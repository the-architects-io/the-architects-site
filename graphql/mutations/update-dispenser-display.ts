import { gql } from "@apollo/client";

export const UPDATE_DISPENSER_DISPLAY = gql`
  mutation UPDATE_DISPENSER_DISPLAY(
    $id: uuid!
    $display: dispenser_displays_set_input!
  ) {
    update_dispenser_displays_by_pk(pk_columns: { id: $id }, _set: $display) {
      id
      textColor
      shouldDisplayRewardsList
      shouldDisplayName
      shouldDisplayImage
      shouldDisplayDescription
      claimButtonColor
      backgroundColor
      dispenser {
        id
      }
    }
  }
`;

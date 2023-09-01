import { gql } from "@apollo/client";

export const UPDATE_DISPENSER = gql`
  mutation UPDATE_DISPENSER($id: uuid!, $setInput: dispensers_set_input!) {
    update_dispensers_by_pk(pk_columns: { id: $id }, _set: $setInput) {
      id
    }
  }
`;

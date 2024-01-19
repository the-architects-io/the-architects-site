import { gql } from "@apollo/client";

export const DELETE_INVITE_CODE = gql`
  mutation DELETE_INVITE_CODE($id: uuid!) {
    delete_inviteCodes_by_pk(id: $id) {
      id
    }
  }
`;

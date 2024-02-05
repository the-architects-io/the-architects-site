import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_USERS } from "@the-architects/blueprint-graphql";

import { User, UsersListItem } from "@/features/admin/users/users-list-item";
import axios from "axios";
import { useState } from "react";
import showToast from "@/features/toasts/show-toast";

export const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { data, refetch } = useQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
    onCompleted({ users }) {
      setUsers(users);
    },
  });

  const deleteAllUsers = async () => {
    const confirm = prompt(
      "Are you sure you want to delete all users? (type 'yes' to confirm)"
    );

    if (confirm !== "yes") return;

    for (const user of users) {
      await axios.post("/api/remove-user", { id: user.id });
    }

    showToast({
      primaryMessage: "Users deleted",
    });

    refetch();
  };

  return (
    <TableWrapper>
      {data?.users?.map((user: User) => {
        return <UsersListItem key={user.id} user={user} refetch={refetch} />;
      })}
    </TableWrapper>
  );
};

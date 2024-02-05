"use client";

import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_DISPENSERS } from "@the-architects/blueprint-graphql";

import { DispensersListItem } from "@/features/admin/dispensers/dispensers-list-item";
import { Dispenser } from "@/app/blueprint/types";

export const DispensersList = () => {
  const { data } = useQuery(GET_DISPENSERS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.dispensers?.map((dispenser: Dispenser) => {
        return <DispensersListItem key={dispenser.id} dispenser={dispenser} />;
      })}
    </TableWrapper>
  );
};

"use client";

import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_ITEMS } from "@/graphql/queries/get-items";
import { ItemsListItem } from "@/features/admin/items/items-list-item";
import { Item } from "@/app/api/add-item/route";

export const ItemsList = () => {
  const { data } = useQuery(GET_ITEMS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.items?.map((item: Item) => {
        return <ItemsListItem key={item.id} item={item} />;
      })}
    </TableWrapper>
  );
};

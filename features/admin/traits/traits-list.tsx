import { useQuery } from "@apollo/client";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_TRAITS } from "@the-architects/blueprint-graphql";

import {
  Trait,
  TraitsListItem,
} from "@/features/admin/traits/traits-list-item";

export const TraitsList = () => {
  const { data } = useQuery(GET_TRAITS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.items?.map((trait: Trait) => {
        return <TraitsListItem key={trait.id} trait={trait} />;
      })}
    </TableWrapper>
  );
};

import { useQuery } from "@apollo/client";
import { TokensListItem } from "@/features/admin/tokens/tokens-list-item";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_TOKENS } from "@/graphql/queries/get-tokens";
import { Token } from "@/features/admin/tokens/tokens-list-item";

export const TokensList = () => {
  const { data } = useQuery(GET_TOKENS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <TableWrapper>
      {data?.tokens?.map((token: Token) => {
        return <TokensListItem key={token.id} token={token} />;
      })}
    </TableWrapper>
  );
};

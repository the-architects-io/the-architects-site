import { useQuery } from "@apollo/client";
import { TokensListItem } from "@/features/admin/tokens/tokens-list-item";
import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { GET_TOKENS_DEPRECATED } from "@/graphql/queries/get-tokens-deprecated";
import { Token } from "@/app/blueprint/types";

export const TokensList = () => {
  const { data } = useQuery(GET_TOKENS_DEPRECATED, {
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

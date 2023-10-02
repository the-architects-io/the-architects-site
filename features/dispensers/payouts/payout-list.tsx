import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { Payout } from "@/app/profile/[id]/page";
import { PayoutListItem } from "@/features/dispensers/payouts/payout-list-item";

export const PayoutList = ({ payouts }: { payouts: Payout[] }) => {
  return (
    <TableWrapper>
      {payouts?.map((payout: Payout) => {
        return <PayoutListItem key={payout.id} payout={payout} />;
      })}
    </TableWrapper>
  );
};

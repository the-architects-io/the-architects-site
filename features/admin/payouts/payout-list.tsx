import { TableWrapper } from "@/features/UI/tables/table-wrapper";
import { PayoutListItem } from "@/features/admin/payouts/payout-list-item";
import { Payout } from "@/app/profile/[id]/page";

export const PayoutList = ({ payouts }: { payouts: Payout[] }) => {
  return (
    <TableWrapper>
      {payouts?.map((payout: Payout) => {
        return <PayoutListItem key={payout.id} payout={payout} />;
      })}
    </TableWrapper>
  );
};

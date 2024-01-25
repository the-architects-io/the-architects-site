"use client";
import { Payout } from "@/app/profile/[id]/page";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import { AggregatePayoutStats } from "@/features/dispensers/payouts/aggregate-payout-stats";
import { PayoutList } from "@/features/dispensers/payouts/payout-list";
import { GET_PAYOUTS_BY_DISPENSER_ID } from "@/graphql/queries/get-payouts-by-dispenser-id";
import { useAdmin } from "@/hooks/admin";
import { useQuery } from "@apollo/client";
import { useState } from "react";

const PayoutsPage = ({ params }: { params: any }) => {
  const { isAdmin } = useAdmin();
  const [payouts, setPayouts] = useState<Payout[] | null>(null);

  const { loading: payoutsLoading } = useQuery(GET_PAYOUTS_BY_DISPENSER_ID, {
    variables: {
      id: params?.id,
    },
    skip: !params?.id,
    onCompleted: ({ payouts }) => {
      console.log({ payouts });
      setPayouts(payouts);
    },
  });
  if (!isAdmin) return <NotAdminBlocker />;

  return (
    <ContentWrapper className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Payouts</h1>
      {payoutsLoading && <p>Loading payouts...</p>}
      {payouts && (
        <>
          <AggregatePayoutStats payouts={payouts} />
          <PayoutList payouts={payouts} />
        </>
      )}
    </ContentWrapper>
  );
};

export default PayoutsPage;

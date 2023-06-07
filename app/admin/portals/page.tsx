"use client";
import { Payout } from "@/app/profile/[id]/page";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { AggregatePayoutStats } from "@/features/admin/payouts/aggregate-payout-stats";
import { PayoutList } from "@/features/admin/payouts/payout-list";
import { GET_PAYOUTS_BY_DISPENSER_ID } from "@/graphql/queries/get-payouts-by-dispenser-id";
import { useQuery } from "@apollo/client";
import { useState } from "react";

const PortalsAdminPage = () => {
  const [payouts, setPayouts] = useState<Payout[] | null>(null);

  const { loading: payoutsLoading } = useQuery(GET_PAYOUTS_BY_DISPENSER_ID, {
    variables: {
      id: "9851135d-7c7a-41f1-91ad-cc6a56ab565c", // Portals Detective Badge Dispenser
    },
    onCompleted: ({ payouts }) => {
      setPayouts(payouts);
    },
  });
  return (
    <ContentWrapper className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Portals Detective Badge Payouts</h1>
      {payoutsLoading && <Spinner />}
      {payouts && (
        <>
          <AggregatePayoutStats payouts={payouts} />
          <PayoutList payouts={payouts} />
        </>
      )}
    </ContentWrapper>
  );
};

export default PortalsAdminPage;

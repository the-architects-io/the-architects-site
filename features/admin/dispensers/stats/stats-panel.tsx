import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import Link from "next/link";
import { useState } from "react";

export const StatsPanel = ({ dispenser }: { dispenser: Dispenser }) => {
  return (
    <>
      <h2 className="text-xl uppercase mb-4">Stats</h2>
      <PrimaryButton>
        <Link href={`${BASE_URL}/admin/dispenser/${dispenser.id}/payouts`}>
          View Payouts
        </Link>
      </PrimaryButton>
    </>
  );
};

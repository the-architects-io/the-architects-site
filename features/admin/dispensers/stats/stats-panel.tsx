import { Dispenser } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import Link from "next/link";

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

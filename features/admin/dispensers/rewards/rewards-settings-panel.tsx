import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import useRewards from "@/app/blueprint/hooks/use-rewards";
import { Dispenser } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { AddRewardForm } from "@/features/admin/dispensers/rewards/add-reward-form";
import { RewardsList } from "@/features/rewards/rewards-list";
import { useState } from "react";

export const RewardsSettingsPanel = ({
  dispenserId,
  dispenser,
  refetch,
}: {
  dispenserId: string;
  dispenser: Dispenser;
  refetch: () => any;
}) => {
  const [isAddingReward, setIsAddingReward] = useState(false);
  // const { isLoading } = useDispenser(dispenserId);

  return (
    <>
      <h2 className="text-xl uppercase mb-4">Rewards</h2>
      {!!dispenser.rewardCollections?.length && (
        <RewardsList dispenserId={dispenser.id} className="mb-4 max-w-md" />
      )}
    </>
  );
};

import { Dispenser } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { AddRewardForm } from "@/features/admin/dispensers/rewards/add-reward-form";
import { RewardsList } from "@/features/rewards/rewards-list";
import { useState } from "react";

export const RewardsSettingsPanel = ({
  dispenser,
  refetch,
}: {
  dispenser: Dispenser;
  refetch: () => any;
}) => {
  const [isAddingReward, setIsAddingReward] = useState(false);

  return (
    <>
      <h2 className="text-xl uppercase mb-4">Rewards</h2>
      {!!dispenser.rewardCollections?.length && (
        <RewardsList dispenserId={dispenser.id} className="mb-4 max-w-md" />
      )}
      {!!isAddingReward && (
        <AddRewardForm dispenserId={dispenser.id} refetch={refetch} />
      )}
      {!isAddingReward && (
        <PrimaryButton onClick={() => setIsAddingReward(!isAddingReward)}>
          Add Reward
        </PrimaryButton>
      )}
    </>
  );
};

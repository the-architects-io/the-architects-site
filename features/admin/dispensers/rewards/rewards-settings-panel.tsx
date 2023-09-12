import { Dispenser } from "@/app/blueprint/types";
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

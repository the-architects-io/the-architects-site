import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { useState } from "react";

export const CostsSettingsPanel = ({
  dispenser,
  refetch,
}: {
  dispenser: Dispenser;
  refetch: () => void;
}) => {
  const [isAddingCost, setIsAddingCost] = useState(false);

  return (
    <>
      <h2 className="text-xl uppercase mb-4">Costs</h2>
      {!!dispenser.costCollections?.length && (
        // <CostsList dispenser={dispenser} className="mb-4" />
        <></>
      )}
      {!!isAddingCost && (
        // <AddCostForm dispenserId={dispenser.id} refetch={refetch} />
        <></>
      )}
      {!isAddingCost && (
        <PrimaryButton onClick={() => setIsAddingCost(!isAddingCost)}>
          Add Cost
        </PrimaryButton>
      )}
    </>
  );
};

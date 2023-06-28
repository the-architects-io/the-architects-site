import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { useState } from "react";

export const GatesSettingsPanel = ({
  dispenser,
  refetch,
}: {
  dispenser: Dispenser;
  refetch: () => void;
}) => {
  const [isAddingGate, setIsAddingGate] = useState(false);

  return (
    <>
      <h2 className="text-xl uppercase mb-4">Gates</h2>
      {!!dispenser.gateCollections?.length && (
        // <GatesList dispenser={dispenser} className="mb-4" />
        <></>
      )}
      {!!isAddingGate && (
        // <AddGateForm dispenserId={dispenser.id} refetch={refetch} />
        <></>
      )}
      {!isAddingGate && (
        <PrimaryButton onClick={() => setIsAddingGate(!isAddingGate)}>
          Add Gate
        </PrimaryButton>
      )}
    </>
  );
};

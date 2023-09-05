import { Dispenser } from "@/app/blueprint/types";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { useState } from "react";

export const RestrictionsSettingsPanel = ({
  dispenser,
  refetch,
}: {
  dispenser: Dispenser;
  refetch: () => void;
}) => {
  const [isAddingRestriction, setIsAddingRestriction] = useState(false);

  return (
    <>
      <h2 className="text-xl uppercase mb-4">Restrictions</h2>
      {!!dispenser.restrictionCollections?.length && (
        // <RestrictionsList dispenser={dispenser} className="mb-4" />
        <></>
      )}
      {!!isAddingRestriction && (
        // <AddRestrictionForm dispenserId={dispenser.id} refetch={refetch} />
        <></>
      )}
      {!isAddingRestriction && (
        <PrimaryButton
          onClick={() => setIsAddingRestriction(!isAddingRestriction)}
        >
          Add Restriction
        </PrimaryButton>
      )}
    </>
  );
};

import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import Spinner from "@/features/UI/spinner";
import { AddCostForm } from "@/features/admin/dispensers/costs/add-cost-form";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { CostsList } from "@/features/dispensers/costs/costs-list";
import showToast from "@/features/toasts/show-toast";
import { REMOVE_COST_COLLECTION } from "@/graphql/mutations/remove-cost-collection";
import { useMutation } from "@apollo/client";
import { useState } from "react";

export const CostsSettingsPanel = ({
  dispenser,
  refetch,
}: {
  dispenser: Dispenser;
  refetch: () => void;
}) => {
  const [isAddingCost, setIsAddingCost] = useState(false);

  const [removeCost, { loading }] = useMutation(REMOVE_COST_COLLECTION, {
    variables: {
      costCollectionId: dispenser?.costCollections?.[0]?.id,
    },
    onCompleted: () => {
      refetch();
      showToast({
        primaryMessage: "Cost removed",
      });
    },
  });

  return (
    <>
      <h2 className="text-xl uppercase mb-4">Costs</h2>
      {!!dispenser.costCollections?.length && (
        <CostsList dispenser={dispenser} className="mb-4" />
      )}
      {!!isAddingCost && !dispenser?.costCollections?.[0]?.id && (
        <AddCostForm
          dispenserId={dispenser.id}
          refetch={refetch}
          setIsAddingCost={setIsAddingCost}
        />
      )}
      {!isAddingCost && (
        <PrimaryButton
          onClick={() => {
            !!dispenser.costCollections?.length
              ? removeCost()
              : setIsAddingCost(!isAddingCost);
          }}
        >
          {loading ? (
            <Spinner />
          ) : (
            <>
              {!!dispenser.costCollections?.length ? "Remove Cost" : "Add Cost"}
            </>
          )}
        </PrimaryButton>
      )}
    </>
  );
};

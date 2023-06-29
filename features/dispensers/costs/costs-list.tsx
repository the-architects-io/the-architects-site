import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import classNames from "classnames";
import { Fragment, useEffect, useState } from "react";

export const CostsList = ({
  dispenser,
  className,
}: {
  dispenser: Dispenser;
  className?: string;
}) => {
  const [costCollections, setCostCollections] = useState<
    Dispenser["costCollections"]
  >([]);

  useEffect(() => {
    const { costCollections } = dispenser;
    if (!costCollections) return;
    setCostCollections(costCollections);
  }, [dispenser]);

  return (
    <div className={classNames([className, "w-full"])}>
      {!!costCollections?.length &&
        costCollections.map(({ itemCollection }, i) => (
          <Fragment key={itemCollection?.id}>
            <div className="flex flex-wrap w-full flex-1 justify-center rounded-lg p-2">
              {!!itemCollection?.name && (
                <>
                  <div className="font-bold text-2xl">
                    {itemCollection?.name}
                  </div>
                </>
              )}
            </div>
          </Fragment>
        ))}
    </div>
  );
};

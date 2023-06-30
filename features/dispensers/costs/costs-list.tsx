import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import useDispenser from "@/hooks/blueprint/use-dispenser";
import classNames from "classnames";
import { Fragment, useEffect, useState } from "react";

export const CostsList = ({
  dispenserId,
  className,
}: {
  dispenserId: string;
  className?: string;
}) => {
  const { cost } = useDispenser(dispenserId);

  return (
    <div className={classNames([className, "w-full"])}>
      {!!cost && (
        <div className="flex flex-wrap w-full flex-1 justify-center rounded-lg p-2">
          <div className="font-bold text-2xl">{cost.name}</div>
        </div>
      )}
    </div>
  );
};

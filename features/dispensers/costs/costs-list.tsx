import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import classNames from "classnames";

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
        <div className="flex w-full justify-center rounded-lg p-2">
          <div className="font-bold text-2xl w-1/2 overflow-hidden">
            {cost.name}
          </div>
          <div className="font-bold text-2xl w-1/2 overflow-hidden text-right">
            {cost.amount}
          </div>
        </div>
      )}
    </div>
  );
};

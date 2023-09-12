import useDispenser from "@/app/blueprint/hooks/use-dispenser";
import classNames from "classnames";
import { Fragment } from "react";

export const CostsList = ({
  dispenserId,
  className,
}: {
  dispenserId: string;
  className?: string;
}) => {
  const { costs } = useDispenser(dispenserId);

  return (
    <div className={classNames([className, "w-full"])}>
      <div className="flex w-full flex-1 justify-between rounded-lg p-2 my-2 text-lg uppercase">
        <div>Cost</div>
        <div>Amount</div>
      </div>
      {!!costs &&
        costs.map(({ token, id, name, amount }) => (
          <Fragment key={id}>
            <div className="flex flex-wrap w-full flex-1 justify-between rounded-lg p-2">
              {!!name && (
                <>
                  <div className="w-full flex justify-between lg:w-2/5 mb-2">
                    <div className="flex flex-col">
                      <div className="mb-2 flex w-1/2">
                        <div className="overflow-hidden rounded-lg truncate">
                          {name}{" "}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-end lg:w-3/5 mb-2">
                    {!!token?.mintAddress && <div>{amount}</div>}
                  </div>
                </>
              )}
            </div>
          </Fragment>
        ))}
    </div>
  );
};

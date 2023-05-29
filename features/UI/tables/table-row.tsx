import classNames from "classnames";

export const TableRow = ({
  children,
  className,
  keyId,
}: {
  children: React.ReactNode;
  className?: string;
  keyId: string;
}) => {
  return (
    <div
      className={classNames([
        "px-4 py-2 rounded-lg border border-stone-700 shadow-2xl bg-stone-800 text-stone-300 w-full flex text-xl items-center space-x-12",
        className,
      ])}
      key={keyId}
    >
      {children}
    </div>
  );
};

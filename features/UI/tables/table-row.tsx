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
        "px-4 py-1 rounded-lg shadow-2xl bg-gray-800 text-stone-300 w-full flex items-center space-x-12 overflow-x-auto",
        className,
      ])}
      key={keyId}
    >
      {children}
    </div>
  );
};

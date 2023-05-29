import classNames from "classnames";

interface TableWrapperProps {
  children: React.ReactNode;
  className?: string;
  isTruncated?: boolean;
}

export const TableWrapper = ({
  children,
  isTruncated = true,
}: TableWrapperProps) => {
  return (
    <div
      className={classNames([
        "w-full bg-stone-900 text-stone-300 mx-auto max-w-6xl p-4 overflow-y-scroll rounded-2xl shadow-2xl",
        isTruncated && "h-[55vh] ",
      ])}
    >
      <div className="space-y-4">{children}</div>
    </div>
  );
};

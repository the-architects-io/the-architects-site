import classNames from "classnames";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Panel = ({ children, className, ...props }: PanelProps) => {
  return (
    <div
      className={classNames(
        "max-w-lg bg-gray-800 rounded-xl shadow-2xl mx-auto p-4 min-w-[400px] text-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

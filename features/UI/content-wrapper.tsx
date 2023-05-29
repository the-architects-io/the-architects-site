import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ContentWrapper = ({ children, className }: Props) => {
  return (
    <div
      className={classNames([
        "pt-36 md:pt-40 max-w-6xl w-full mx-auto px-6 5xl:px-0",
        className,
      ])}
    >
      {children}
    </div>
  );
};

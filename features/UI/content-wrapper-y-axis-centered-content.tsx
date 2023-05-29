import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ContentWrapperYAxisCenteredContent = ({
  children,
  className,
}: Props) => (
  <div
    className={classNames([
      "flex flex-col items-center h-app justify-center -mt-36",
      className,
    ])}
  >
    {children}
  </div>
);

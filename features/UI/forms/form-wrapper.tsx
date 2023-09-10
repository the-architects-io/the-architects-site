import classNames from "classnames";

export interface FormWrapperProps
  extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

export const FormWrapper = ({
  children,
  className,
  onSubmit,
  ...props
}: FormWrapperProps) => {
  return (
    <form
      className={classNames(
        "flex flex-wrap max-w-lg bg-gray-800 text-gray-100 rounded-xl mx-auto p-4 space-y-4 min-w-[400px]",
        className
      )}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  );
};

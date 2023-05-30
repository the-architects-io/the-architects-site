import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  type?: "submit" | undefined;
  disabled?: boolean;
}

export const SecondaryButton = ({ disabled, children, ...props }: Props) => {
  return (
    <button
      onClick={props?.onClick}
      disabled={disabled}
      className={classNames([
        "bg-cyan-600 hover:bg-cyan-400 rounded-xl p-4 py-2 uppercase text-stone-300 hover:text-stone-600 border hover:font-bold border-stone-600 tracking-wider",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        props.className,
      ])}
      type={props.type}
    >
      <>{children}</>
    </button>
  );
};

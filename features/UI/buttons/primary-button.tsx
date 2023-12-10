"use client";
import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  type?: "submit" | undefined;
  disabled?: boolean;
}

export const PrimaryButton = ({ disabled, children, ...props }: Props) => {
  return (
    <button
      onClick={props?.onClick}
      disabled={disabled}
      className={classNames([
        "bg-sky-300 hover:bg-sky-200 text-gray-800 rounded-xl p-4 py-2 uppercase border border-gray-800 hover:border-gray-800 font-bold transition-colors duration-300 ease-in-out flex justify-center items-center",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        props.className,
      ])}
      type={props.type}
    >
      <>{children}</>
    </button>
  );
};

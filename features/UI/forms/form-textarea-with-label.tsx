import classNames from "classnames";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const FormTextareaWithLabel = ({
  onChange,
  value,
  label,
  ...props
}: Props) => {
  return (
    <label
      htmlFor={props.name}
      className="flex flex-col w-full text-stone-900 font-bold"
    >
      {label}
      <textarea
        rows={props.rows || 3}
        cols={props.cols || 50}
        name={props.name}
        placeholder={props.placeholder}
        className={classNames(
          "w-full px-4 py-2 text-stone-300 bg-stone-900 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 ",
          props.className
        )}
        onChange={onChange}
        value={value}
      />
    </label>
  );
};

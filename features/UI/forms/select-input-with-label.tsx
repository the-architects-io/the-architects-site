import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLSelectElement> {
  value: string;
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: {
    label: string;
    value: string;
  }[];
  placeholder: string;
  hideLabel?: boolean;
}

export const SelectInputWithLabel = ({
  value,
  onChange,
  onBlur,
  options,
  label,
  name,
  placeholder,
  hideLabel,
}: Props) => {
  return (
    <label htmlFor={name} className="flex flex-col w-full">
      {hideLabel ? null : label}
      <select
        className={classNames(
          "p-2 rounded-xl w-full text-gray-300 bg-gray-500",
          hideLabel ? "mt-0" : "mt-2"
        )}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      >
        <option value="" label={placeholder} disabled />
        {options?.map((option) => (
          <option
            value={option.value}
            label={option.label}
            key={option.value}
          />
        ))}
      </select>
    </label>
  );
};

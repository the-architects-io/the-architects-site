import { FormInput } from "@/features/UI/forms/form-input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormInputWithLabel = ({
  children,
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
      <FormInput
        className="mt-2"
        type={props.type || "text"}
        name={props.name}
        placeholder={props.placeholder}
        onChange={onChange}
        value={value}
      />
    </label>
  );
};

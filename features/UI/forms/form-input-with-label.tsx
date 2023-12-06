import { FormInput } from "@/features/UI/forms/form-input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const FormInputWithLabel = ({
  children,
  onChange,
  value,
  label,
  description,
  ...props
}: Props) => {
  return (
    <label htmlFor={props.name} className="flex flex-col w-full">
      {label}
      <FormInput
        className="mt-2"
        type={props.type || "text"}
        name={props.name}
        placeholder={props.placeholder}
        onChange={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange?.(e);
        }}
        value={value}
        {...props}
      />
      {children}
      {description && (
        <p className="text-sm text-gray-400 my-4 italic">{description}</p>
      )}
    </label>
  );
};

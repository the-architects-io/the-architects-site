import { FormikHandlers } from "formik";

interface Props {
  label: string;
  onChange: FormikHandlers["handleChange"];
  value: boolean;
  name: string;
}

export const FormCheckboxWithLabel = ({
  label,
  onChange,
  value,
  name,
  ...props
}: Props) => {
  return (
    <label htmlFor={name} className="flex space-x-4">
      <input
        type="checkbox"
        name={name}
        checked={value || false}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
};

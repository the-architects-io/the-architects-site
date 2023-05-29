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
    <label htmlFor={name} className="flex text-stone-900 font-bold space-x-4">
      <input type="checkbox" name={name} checked={value} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
};

import classNames from "classnames";
import { FormikHandlers } from "formik";

interface Props {
  label: string;
  onChange: FormikHandlers["handleChange"];
  value: boolean;
  name: string;
  className?: string;
}

export const FormCheckboxWithLabel = ({
  label,
  onChange,
  value,
  name,
  className,
  ...props
}: Props) => {
  return (
    <label htmlFor={name} className={classNames(["flex space-x-4", className])}>
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

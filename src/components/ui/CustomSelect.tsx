import React, { forwardRef } from "react";
import type { FieldError } from "react-hook-form";

interface CustomSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError | string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  placeholder?: string;
}

const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  (
    {
      label,
      error,
      containerClassName = "",
      labelClassName = "",
      selectClassName = "",
      errorClassName = "",
      placeholder = "Please select an option",
      children,
      className,
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === "string" ? error : error?.message;

    const baseSelectClasses = `
      w-full px-4 py-2 border rounded-lg 
      focus:ring-2 focus:ring-indigo-500 focus:border-transparent
      transition-colors duration-200
      ${error ? "border-red-500" : "border-gray-300"}
    `;

    const baseLabelClasses = `
      block text-sm font-medium mb-2
      ${error ? "text-gray-700" : "text-gray-700"}
    `;

    const baseErrorClasses = `
      text-red-500 text-sm mt-1
    `;

    return (
      <div className={containerClassName}>
        <label className={`${baseLabelClasses} ${labelClassName}`}>
          {label}
        </label>
        <select
          ref={ref}
          className={`${baseSelectClasses} ${selectClassName} ${
            className || ""
          }`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {children}
        </select>
        {errorMessage && (
          <p className={`${baseErrorClasses} ${errorClassName}`}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";

export default CustomSelect;

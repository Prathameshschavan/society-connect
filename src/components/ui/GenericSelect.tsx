import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

export type OptionValue = string | number;
type Option<T extends OptionValue = OptionValue> = {
  value: T;
  label: React.ReactNode;
};

type GenericSelectProps<T extends OptionValue> = {
  id: string;
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

export function GenericSelect<T extends OptionValue>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  disabled = false,
}: GenericSelectProps<T>) {
  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={id}
          className={`mb-1 block text-sm font-medium ${
            error ? "text-red-700" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}

      <select
        id={id}
        value={String(value)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          block w-full rounded-md border px-3 py-2 pr-10 text-sm
          ${
            error
              ? "border-red-500 focus:border-red-600 focus:ring-red-600"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/30"
          }
          text-gray-900 hover:border-gray-400 appearance-none cursor-pointer
          focus:outline-none focus:ring-2
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
        `}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option
            key={String(o.value)}
            value={String(o.value)}
            className="cursor-pointer"
          >
            {o.label}
          </option>
        ))}
      </select>

      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-[38px] w-4 h-4 text-gray-400"
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

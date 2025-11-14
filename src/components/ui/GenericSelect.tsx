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
  onChange: (value: string) => void;
};

export function GenericSelect<T extends OptionValue>({
  id,
  label,
  value,
  options,
  onChange,
}: GenericSelectProps<T>) {
  return (
    <div className="relative w-full">
      {label ? (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      ) : null}

      <select
        id={id}
        value={String(value)}
        className="
          block  rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900
           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30
          hover:border-gray-400 appearance-none cursor-pointer
        "
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw);
        }}
      >
        {options.map((o) => (
          <option className="cursor-pointer " key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>

      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-8 inline-block w-[18px] text-[gray]"
      />
    </div>
  );
}

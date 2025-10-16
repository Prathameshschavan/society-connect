import React, { forwardRef } from "react";

type Size = "sm" | "md" | "lg";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: Size;
  name?: string;
  value?: string;
  id?: string;
  // Tailwind color when ON
  colorClass?: string; // e.g. "bg-blue-600"
}

const sizes: Record<Size, { track: string; thumb: string; translate: string }> =
  {
    sm: { track: "w-9 h-5", thumb: "h-4 w-4", translate: "translate-x-4" },
    md: { track: "w-11 h-6", thumb: "h-5 w-5", translate: "translate-x-5" },
    lg: { track: "w-14 h-7", thumb: "h-6 w-6", translate: "translate-x-7" },
  };

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      checked,
      onChange,
      label,
      description,
      disabled,
      size = "md",
      name,
      value = "on",
      id,
      colorClass = "bg-blue-600",
      className = "",
      ...rest
    },
    ref
  ) {
    const s = sizes[size];
    const baseTrack =
      "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-800";
    const offTrack = "bg-gray-200 dark:bg-gray-700";
    const onTrack = colorClass;
    const baseThumb =
      "pointer-events-none inline-block transform rounded-full bg-white border border-gray-300 shadow-sm transition duration-200 ease-in-out dark:border-gray-500";

    return (
      <label
        className={`inline-flex items-start gap-3 ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {/* Hidden input for form compatibility */}
        {name ? (
          <input type="hidden" name={name} value={checked ? value : ""} />
        ) : null}

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled || undefined}
          aria-labelledby={id ? `${id}-label` : undefined}
          aria-describedby={description ? `${id}-desc` : undefined}
          onClick={() => !disabled && onChange(!checked)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "ArrowLeft") onChange(false);
            if (e.key === "ArrowRight") onChange(true);
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              onChange(!checked);
            }
          }}
          disabled={disabled}
          className={[
            baseTrack,
            s.track,
            checked ? onTrack : offTrack,
            disabled ? "ring-0" : "",
            className,
          ].join(" ")}
          ref={ref}
          {...rest}
        >
          <span
            aria-hidden="true"
            className={[
              baseThumb,
              s.thumb,
              "translate-x-0",
              checked ? s.translate : "",
              "absolute top-1/2 -translate-y-1/2 left-0.5",
            ].join(" ")}
          />
        </button>

        {(label || description) && (
          <span className="select-none">
            {label ? (
              <span
                id={id ? `${id}-label` : undefined}
                className="block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                {label}
              </span>
            ) : null}
            {description ? (
              <span
                id={id ? `${id}-desc` : undefined}
                className="block text-xs text-gray-500 dark:text-gray-400"
              >
                {description}
              </span>
            ) : null}
          </span>
        )}
      </label>
    );
  }
);

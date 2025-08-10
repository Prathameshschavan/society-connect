import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { FieldError } from 'react-hook-form';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError | string;
  isPassword?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      error,
      isPassword = false,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      errorClassName = '',
      type = 'text',
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine the input type
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Get error message
    const errorMessage = typeof error === 'string' ? error : error?.message;

    // Base CSS classes
    const baseInputClasses = `
      w-full px-4 py-3 border rounded-lg 
      focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
      transition-colors duration-200
      ${error ? 'border-red-500' : 'border-gray-300'}
      ${isPassword ? 'pr-12' : ''}
    `;

    const baseLabelClasses = `
      block text-sm font-medium mb-2
      ${error ? 'text-red-700' : 'text-gray-700'}
    `;

    const baseErrorClasses = `
      text-red-500 text-sm mt-1
    `;

    return (
      <div className={`${containerClassName}`}>
        <label className={`${baseLabelClasses} ${labelClassName}`}>
          {label}
        </label>
        
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`${baseInputClasses} ${inputClassName} ${className || ''}`}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        
        {errorMessage && (
          <p className={`${baseErrorClasses} ${errorClassName}`}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;

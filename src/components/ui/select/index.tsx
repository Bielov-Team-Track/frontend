import React, { forwardRef } from "react";
import { FaChevronDown, FaExclamationCircle } from "react-icons/fa";
import { responsiveClasses } from "@/lib/utils/responsive";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "size" | "onChange"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "bordered" | "ghost";
  selectSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: React.ReactNode;
  value?: string | number;
  onChange?: (value: string | number | undefined) => void;
  clearable?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "bordered",
      selectSize = "md",
      fullWidth = true,
      options,
      placeholder,
      leftIcon,
      className = "",
      disabled,
      value,
      onChange,
      clearable = false,
      ...props
    },
    ref
  ) => {
    // Build CSS classes
    const baseClasses =
      "select w-full transition-colors duration-200 appearance-none";

    const variantClasses = {
      default: "select-ghost",
      bordered: "select-bordered",
      ghost: "select-ghost",
    };

    const sizeClasses = {
      sm: "select-sm text-mobile-sm sm:text-mobile-base",
      md: "select-md text-mobile-base sm:text-tablet-base lg:text-desktop-base",
      lg: "select-lg text-mobile-base sm:text-tablet-base lg:text-desktop-lg",
    };

    const stateClasses = {
      error: "select-error border-red-500 focus:border-red-500",
      disabled: "select-disabled opacity-60 cursor-not-allowed",
    };

    const selectClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[selectSize],
      error ? stateClasses.error : "",
      disabled ? stateClasses.disabled : "",
      !fullWidth ? "w-auto" : "",
      leftIcon ? "pl-10" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      "block font-medium mb-2",
      responsiveClasses.text.label,
      error ? "text-red-600" : "text-base-content",
      disabled ? "opacity-60" : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Handle change event
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      if (onChange) {
        // If empty string (placeholder selected), pass undefined
        onChange(newValue === "" ? undefined : newValue);
      }
      // Also call the original onChange if provided in props
      if (props.onChange) {
        props.onChange(e);
      }
    };

    // Determine the display value
    const displayValue = value ?? "";

    return (
      <div className={`form-control ${fullWidth ? "w-full" : "w-auto"}`}>
        {label && (
          <label className={labelClasses}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <span className="text-base-content/60">{leftIcon}</span>
            </div>
          )}

          {/* Select Field */}
          <select
            ref={ref}
            className={selectClasses}
            disabled={disabled}
            value={displayValue}
            onChange={handleChange}
            {...props}
          >
            {/* Placeholder or Clear option */}
            <option value="" disabled>
              {placeholder || (clearable ? "-- Clear --" : "-- Select --")}
            </option>

            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaChevronDown className="text-base-content/60" size={12} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-1 mt-1 text-red-600">
            <FaExclamationCircle size={12} />
            <span className={responsiveClasses.text.caption}>{error}</span>
          </div>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <div className="mt-1">
            <span
              className={`${responsiveClasses.text.caption} text-base-content/70`}
            >
              {helperText}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

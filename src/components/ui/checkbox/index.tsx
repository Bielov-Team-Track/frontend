"use client";

import React, { forwardRef, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { responsiveClasses } from "@/lib/utils/responsive";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "primary" | "secondary" | "accent" | "success" | "warning" | "error";
  checkboxSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "primary",
      checkboxSize = "md",
      fullWidth = true,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Build CSS classes
    const baseClasses =
      "checkbox transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";

    const variantClasses = {
      primary: "checkbox-primary",
      secondary: "checkbox-secondary",
      accent: "checkbox-accent",
      success: "checkbox-success",
      warning: "checkbox-warning",
      error: "checkbox-error",
    };

    const sizeClasses = {
      sm: "checkbox-sm",
      md: "checkbox-md",
      lg: "checkbox-lg",
    };

    const stateClasses = {
      error: "checkbox-error",
      focused: "ring-2 ring-primary ring-opacity-20",
      disabled: "checkbox-disabled opacity-60 cursor-not-allowed",
    };

    const checkboxClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[checkboxSize],
      error ? stateClasses.error : "",
      isFocused && !error ? stateClasses.focused : "",
      disabled ? stateClasses.disabled : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`form-control ${fullWidth ? "w-full" : "w-auto"}`}>
        <label className="label cursor-pointer justify-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            className={checkboxClasses}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {label && (
            <span
              className={`label-text ${
                error ? "text-red-600" : "text-base-content"
              } ${disabled ? "opacity-60" : ""} ${responsiveClasses.text.base}`}
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          )}
        </label>

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

Checkbox.displayName = "Checkbox";

export default Checkbox;
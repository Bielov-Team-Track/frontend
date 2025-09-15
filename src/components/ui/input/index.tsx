"use client";

import React, { forwardRef, useState } from "react";
import { FaRegEye, FaRegEyeSlash, FaExclamationCircle } from "react-icons/fa";
import { responsiveClasses } from "@/lib/utils/responsive";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "bordered" | "ghost";
  inputSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "bordered",
      inputSize = "md",
      fullWidth = true,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      type = "text",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine input type for password visibility toggle
    const inputType = type === "password" && showPassword ? "text" : type;

    // Build CSS classes
    const baseClasses =
      "input w-full transition-colors duration-200 focus:outline-none" +
      "focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-md outline-1 outline-base-content/20 " +
      "bg-base-100 text-base-content placeholder:text-base-content/60 focus:placeholder:text";

    const variantClasses = {
      default: "input-ghost",
      bordered: "input-bordered",
      ghost: "input-ghost",
    };

    const sizeClasses = {
      sm: "input-sm text-mobile-sm sm:text-mobile-base",
      md: "input-md text-mobile-base sm:text-tablet-base lg:text-desktop-base",
      lg: "input-lg text-mobile-base sm:text-tablet-base lg:text-desktop-lg",
    };

    const stateClasses = {
      error: "input-error border-red-500 focus:border-red-500",
      focused: "ring-2 ring-primary ring-opacity-20",
      disabled: "input-disabled opacity-60 cursor-not-allowed",
    };

    const inputClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[inputSize],
      error ? stateClasses.error : "",
      isFocused && !error ? stateClasses.focused : "",
      disabled ? stateClasses.disabled : "",
      !fullWidth ? "w-auto" : "",
      leftIcon ? "pl-10" : "",
      rightIcon || (type === "password" && showPasswordToggle) ? "pr-10" : "",
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-base-content/60">{leftIcon}</span>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
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

          {/* Right Icon or Password Toggle */}
          {(rightIcon || (type === "password" && showPasswordToggle)) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {type === "password" && showPasswordToggle ? (
                <button
                  type="button"
                  className="text-base-content/60 hover:text-base-content focus:text-base-content transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaRegEyeSlash size={16} />
                  ) : (
                    <FaRegEye size={16} />
                  )}
                </button>
              ) : (
                <span className="text-base-content/60">{rightIcon}</span>
              )}
            </div>
          )}
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
              className={`${responsiveClasses.text.caption} text-primary-content/40 text-sm`}
            >
              {helperText}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

"use client";

import React, { forwardRef, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { responsiveClasses } from "@/lib/utils/responsive";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "bordered" | "ghost";
  textAreaSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  minRows?: number;
  maxRows?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "bordered",
      textAreaSize = "md",
      fullWidth = true,
      maxLength,
      showCharCount = false,
      minRows = 3,
      maxRows,
      className = "",
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Calculate character count
    const characterCount = typeof value === "string" ? value.length : 0;

    // Build CSS classes
    const baseClasses = "textarea resize-y transition-colors duration-200";

    const variantClasses = {
      default: "textarea-ghost",
      bordered: "textarea-bordered",
      ghost: "textarea-ghost",
    };

    const sizeClasses = {
      sm: "textarea-sm text-mobile-sm sm:text-mobile-base",
      md: "textarea-md text-mobile-base sm:text-tablet-base lg:text-desktop-base",
      lg: "textarea-lg text-mobile-base sm:text-tablet-base lg:text-desktop-lg",
    };

    const stateClasses = {
      error: "textarea-error border-red-500 focus:border-red-500",
      focused: "ring-2 ring-primary ring-opacity-20",
      disabled: "textarea-disabled opacity-60 cursor-not-allowed",
    };

    const textAreaClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[textAreaSize],
      error ? stateClasses.error : "",
      isFocused && !error ? stateClasses.focused : "",
      disabled ? stateClasses.disabled : "",
      !fullWidth ? "w-auto" : "w-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      "block font-medium",
      responsiveClasses.text.label,
      error ? "text-red-600" : "text-base-content",
      disabled ? "opacity-60" : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Calculate rows based on constraints
    const getRows = () => {
      if (props.rows) return props.rows;
      return Math.max(minRows, maxRows ? Math.min(minRows, maxRows) : minRows);
    };

    return (
      <div className={`form-control ${fullWidth ? "w-full" : "w-auto"}`}>
        {label && (
          <label className={labelClasses}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <div className="mb-1">
            <span
              className={`${responsiveClasses.text.caption} text-primary-content/40 text-sm`}
            >
              {helperText}
            </span>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            className={textAreaClasses}
            disabled={disabled}
            maxLength={maxLength}
            rows={getRows()}
            value={value}
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

          {/* Character count */}
          {(showCharCount || maxLength) && (
            <div className="absolute bottom-2 right-2 pointer-events-none">
              <span
                className={`${responsiveClasses.text.caption} text-base-content/50 bg-base-100 px-1 rounded`}
              >
                {characterCount}
                {maxLength && `/${maxLength}`}
              </span>
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

        {/* Character limit warning */}
        {maxLength && characterCount > maxLength * 0.9 && (
          <div className="mt-1">
            <span
              className={`${responsiveClasses.text.caption} ${
                characterCount >= maxLength ? "text-red-600" : "text-yellow-600"
              }`}
            >
              {characterCount >= maxLength
                ? "Maximum character limit reached"
                : `Approaching character limit (${characterCount}/${maxLength})`}
            </span>
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;

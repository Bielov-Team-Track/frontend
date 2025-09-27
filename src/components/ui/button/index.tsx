"use client";

import React, { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost" | "link" | "icon";
  color?: "primary" | "secondary" | "accent" | "neutral" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "solid",
      color = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      "inline-flex items-center min-w-max max-h-min justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

    // Color scheme classes
    const colorClasses = {
      primary: {
        base: "primary",
        content: "primary-content",
        hover: "primary/90",
        focus: "primary/50",
      },
      secondary: {
        base: "secondary",
        content: "secondary-content",
        hover: "secondary/90",
        focus: "secondary/50",
      },
      accent: {
        base: "accent",
        content: "accent-content",
        hover: "accent/90",
        focus: "accent/50",
      },
      neutral: {
        base: "neutral",
        content: "neutral-content",
        hover: "neutral/90",
        focus: "neutral/50",
      },
      success: {
        base: "success",
        content: "success-content",
        hover: "success/90",
        focus: "success/50",
      },
      warning: {
        base: "warning",
        content: "warning-content",
        hover: "warning/90",
        focus: "warning/50",
      },
      error: {
        base: "error",
        content: "error-content",
        hover: "error/90",
        focus: "error/50",
      },
    };

    const currentColor = colorClasses[color];

    // Variant classes (structural)
    const variantClasses = {
      solid: [
        `bg-${currentColor.base} hover:bg-${currentColor.hover} focus:bg-${currentColor.hover}`,
        `text-${currentColor.content}`,
        "shadow-md hover:shadow-lg",
        `focus:ring-${currentColor.focus}`,
        "active:scale-[0.98]",
      ].join(" "),
      outline: [
        `bg-transparent hover:bg-${currentColor.base}/10 focus:bg-${currentColor.base}/10`,
        `text-${currentColor.content} hover:text-${currentColor.base}`,
        `border-2 border-${currentColor.base}`,
        "hover:shadow-sm",
        `focus:ring-${currentColor.focus}`,
        "active:scale-[0.98]",
      ].join(" "),
      ghost: [
        `bg-transparent hover:bg-${currentColor.base}/10 focus:bg-${currentColor.base}/10`,
        `text-${currentColor.base}`,
        "hover:shadow-sm",
        `focus:ring-${currentColor.focus}`,
        "active:scale-[0.98]",
      ].join(" "),
      link: [
        "bg-transparent p-0",
        `text-${currentColor.base} hover:text-${currentColor.hover} focus:text-${currentColor.hover}`,
        "underline decoration-2 underline-offset-2",
        "active:scale-[0.98]",
      ].join(" "),
      icon: [
        `bg-transparent hover:bg-${currentColor.base}/10 focus:bg-${currentColor.base}/10`,
        `text-${currentColor.base}`,
        "p-2 rounded-full",
        "hover:shadow-sm",
        `focus:ring-${currentColor.focus}`,
        "active:scale-[0.98]",
      ].join(" "),
    };

    // Size classes with responsive typography
    const sizeClasses = {
      sm: [
        "px-3 py-1.5 gap-1.5",
        "text-mobile-sm sm:text-mobile-base",
        "min-h-[2rem]",
      ].join(" "),
      md: [
        "px-4 py-2 gap-2",
        "text-mobile-base sm:text-tablet-base lg:text-desktop-base",
        "min-h-[2.5rem]",
      ].join(" "),
      lg: [
        "px-6 py-3 gap-2",
        "text-mobile-base sm:text-tablet-base lg:text-desktop-lg",
        "min-h-[3rem]",
      ].join(" "),
      xl: [
        "px-8 py-4 gap-3",
        "text-mobile-lg sm:text-tablet-lg lg:text-xl",
        "min-h-[3.5rem]",
      ].join(" "),
    };

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Build final classes
    const buttonClasses = [
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? "w-full" : "",
      loading ? "cursor-wait" : "",
      baseClasses,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span className={loading ? "opacity-75" : ""}>{children}</span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

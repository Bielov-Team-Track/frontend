"use client";

import { default as LinkNext } from "next/link";
import React, { forwardRef } from "react";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "ghost"
    | "outline"
    | "link"
    | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  href?: string;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      variant = "link",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      href,
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      "inline-flex items-center min-w-max max-h-min justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

    // Variant classes
    const variantClasses = {
      primary: [
        "bg-primary hover:bg-primary/90 focus:bg-primary/90",
        "text-primary-content",
        "shadow-md hover:shadow-lg",
        "focus:ring-primary/50",
        "active:scale-[0.98]",
      ].join(" "),
      secondary: [
        "bg-secondary hover:bg-secondary/90 focus:bg-secondary/90",
        "text-secondary-content",
        "shadow-md hover:shadow-lg",
        "focus:ring-secondary/50",
        "active:scale-[0.98]",
      ].join(" "),
      accent: [
        "bg-accent hover:bg-accent/90 focus:bg-accent/90",
        "text-accent-content",
        "shadow-md hover:shadow-lg",
        "focus:ring-accent/50",
        "active:scale-[0.98]",
      ].join(" "),
      ghost: [
        "bg-transparent hover:bg-base-200 focus:bg-base-200",
        "text-base-content",
        "hover:shadow-sm",
        "focus:ring-base-300",
        "active:scale-[0.98]",
      ].join(" "),
      outline: [
        "bg-transparent hover:bg-base-100 focus:bg-base-100",
        "text-base-content",
        "border-2 border-base-300 hover:border-base-400",
        "hover:shadow-sm",
        "focus:ring-base-300",
        "active:scale-[0.98]",
      ].join(" "),
      link: [
        "p-0 px-0 py-0",
        "bg-transparent",
        "text-neutral hover:text-neutral/80 focus:text-neutral/80",
        "underline decoration-2 underline-offset-2",
        "active:scale-[0.98]",
      ].join(" "),
      icon: [
        "bg-transparent hover:bg-base-200 focus:bg-base-200",
        "text-base-content",
        "rounded-full",
        "hover:shadow-sm",
        "focus:ring-base-300",
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

    // Build final classes
    const buttonClasses = [
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? "w-full" : "",
      className,
      baseClasses,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <LinkNext ref={ref} href={href || "#"} className={buttonClasses}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </LinkNext>
    );
  }
);

Link.displayName = "Link";

export default Link;

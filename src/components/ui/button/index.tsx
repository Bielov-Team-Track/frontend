"use client";

import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

type ButtonVariant = "solid" | "outline" | "ghost" | "link" | "soft";
type ButtonColor = "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
	variant?: ButtonVariant;
	color?: ButtonColor;
	size?: ButtonSize;
	fullWidth?: boolean;
	square?: boolean;
	circle?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "solid",
			color = "primary",
			size = "md",
			fullWidth = false,
			square = false,
			circle = false,
			leftIcon,
			rightIcon,
			loading = false,
			disabled,
			className,
			children,
			...props
		},
		ref
	) => {
		// Map variant to DaisyUI style class
		const variantClass = {
			solid: "",
			outline: "btn-outline",
			ghost: "btn-ghost",
			link: "btn-link",
			soft: "btn-soft",
		}[variant];

		// Map color to DaisyUI color class
		const colorClass = `btn-${color}`;

		// Map size to DaisyUI size class
		const sizeClass = `btn-${size}`;

		return (
			<button
				ref={ref}
				className={cn(
					"btn",
					colorClass,
					variantClass,
					sizeClass,
					fullWidth && "btn-block",
					square && "btn-square",
					circle && "btn-circle",
					className
				)}
				disabled={disabled || loading}
				{...props}
			>
				{loading && <span className="loading loading-spinner loading-sm" />}
				{!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
				{children}
				{!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
			</button>
		);
	}
);

Button.displayName = "Button";

export default Button;

"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

const buttonVariants = cva(
	"inline-flex items-center min-w-max max-h-min justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed",
	{
		variants: {
			variant: {
				solid: "shadow-md hover:shadow-lg active:scale-[0.98]",
				outline:
					"bg-transparent border-2 hover:shadow-sm active:scale-[0.98]",
				ghost: "hover:shadow-sm active:scale-[0.98]",
				link: "bg-transparent p-0 underline decoration-2 underline-offset-2 active:scale-[0.98]",
				icon: "bg-transparent py-2 !px-2 rounded-xl hover:bg-white/5 active:scale-[0.98]",
			},
			color: {
				primary: "",
				secondary: "",
				accent: "",
				neutral: "",
				success: "",
				warning: "",
				error: "",
			},
			size: {
				sm: "px-3 py-1.5 gap-1.5 text-mobile-sm sm:text-mobile-base min-h-[2rem]",
				md: "px-4 py-2 gap-2 text-mobile-base sm:text-tablet-base lg:text-desktop-base min-h-[2.5rem]",
				lg: "px-6 py-3 gap-2 text-mobile-base sm:text-tablet-base lg:text-desktop-lg min-h-[3rem]",
				xl: "px-8 py-4 gap-3 text-mobile-lg sm:text-tablet-lg lg:text-xl min-h-[3.5rem]",
			},
			fullWidth: {
				true: "w-full",
				false: "",
			},
			loading: {
				true: "cursor-wait",
				false: "",
			},
		},
		compoundVariants: [
			// Solid variants with colors
			{
				variant: "solid",
				color: "primary",
				class: "bg-primary text-white hover:bg-primary/90 focus:bg-primary/90 focus:ring-primary/50",
			},
			{
				variant: "solid",
				color: "secondary",
				class: "bg-secondary text-white hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-secondary/50",
			},
			{
				variant: "solid",
				color: "accent",
				class: "bg-accent text-accent-content hover:bg-accent/90 focus:bg-accent/90 focus:ring-accent/50",
			},
			{
				variant: "solid",
				color: "neutral",
				class: "bg-neutral text-white hover:bg-neutral/90 focus:bg-neutral/90 focus:ring-neutral/50",
			},
			{
				variant: "solid",
				color: "success",
				class: "bg-success text-white hover:bg-success/90 focus:bg-success/90 focus:ring-success/50",
			},
			{
				variant: "solid",
				color: "warning",
				class: "bg-warning text-white hover:bg-warning/90 focus:bg-warning/90 focus:ring-warning/50",
			},
			{
				variant: "solid",
				color: "error",
				class: "bg-error text-white hover:bg-error/90 focus:bg-error/90 focus:ring-error/50",
			},
			// Outline variants with colors
			{
				variant: "outline",
				color: "primary",
				class: "text-primary border-primary hover:bg-primary/10 focus:bg-primary/10 focus:ring-primary/50",
			},
			{
				variant: "outline",
				color: "secondary",
				class: "text-secondary border-secondary hover:bg-secondary/10 focus:bg-secondary/10 focus:ring-secondary/50",
			},
			{
				variant: "outline",
				color: "accent",
				class: "text-accent border-accent hover:bg-accent/10 focus:bg-accent/10 focus:ring-accent/50",
			},
			{
				variant: "outline",
				color: "neutral",
				class: "text-neutral border-neutral hover:bg-neutral/10 focus:bg-neutral/10 focus:ring-neutral/50",
			},
			{
				variant: "outline",
				color: "success",
				class: "text-success border-success hover:bg-success/10 focus:bg-success/10 focus:ring-success/50",
			},
			{
				variant: "outline",
				color: "warning",
				class: "text-warning border-warning hover:bg-warning/10 focus:bg-warning/10 focus:ring-warning/50",
			},
			{
				variant: "outline",
				color: "error",
				class: "text-error border-error hover:bg-error/10 focus:bg-error/10 focus:ring-error/50",
			},
			// Ghost variants with colors
			{
				variant: "ghost",
				color: "primary",
				class: "bg-primary/10 text-primary hover:bg-primary/40 focus:bg-primary/80 focus:ring-primary/50",
			},
			{
				variant: "ghost",
				color: "secondary",
				class: "bg-secondary/10 text-secondary hover:bg-secondary/40 focus:bg-secondary/80 focus:ring-secondary/50",
			},
			{
				variant: "ghost",
				color: "accent",
				class: "bg-accent/10 text-accent hover:bg-accent/40 focus:bg-accent/80 focus:ring-accent/50",
			},
			{
				variant: "ghost",
				color: "neutral",
				class: "bg-neutral/10 text-muted hover:bg-white/10 focus:bg-white/10  focus:ring-white/15",
			},
			{
				variant: "ghost",
				color: "success",
				class: "bg-success/10 text-success hover:bg-success/40 focus:bg-success/80 focus:ring-success/50",
			},
			{
				variant: "ghost",
				color: "warning",
				class: "bg-warning/10 text-warning hover:bg-warning/40 focus:bg-warning/80 focus:ring-warning/50",
			},
			{
				variant: "ghost",
				color: "error",
				class: "bg-error/10 text-error hover:bg-error/40 focus:bg-error/80 focus:ring-error/50",
			},
			// Link variants with colors
			{
				variant: "link",
				color: "primary",
				class: "text-primary hover:text-primary/90 focus:text-primary/90",
			},
			{
				variant: "link",
				color: "secondary",
				class: "text-secondary hover:text-secondary/90 focus:text-secondary/90",
			},
			{
				variant: "link",
				color: "accent",
				class: "text-accent hover:text-accent/90 focus:text-accent/90",
			},
			{
				variant: "link",
				color: "neutral",
				class: "text-neutral hover:text-neutral/90 focus:text-neutral/90",
			},
			{
				variant: "link",
				color: "success",
				class: "text-success hover:text-success/90 focus:text-success/90",
			},
			{
				variant: "link",
				color: "warning",
				class: "text-warning hover:text-warning/90 focus:text-warning/90",
			},
			{
				variant: "link",
				color: "error",
				class: "text-error hover:text-error/90 focus:text-error/90",
			},
			// Icon variants with colors
			{
				variant: "icon",
				color: "primary",
				class: "text-primary hover:bg-primary/10 focus:bg-primary/10 focus:ring-primary/50",
			},
			{
				variant: "icon",
				color: "secondary",
				class: "text-secondary hover:bg-secondary/10 focus:bg-secondary/10 focus:ring-secondary/50",
			},
			{
				variant: "icon",
				color: "accent",
				class: "bg-accent text-white hover:bg-accent/90",
			},
			{
				variant: "icon",
				color: "neutral",
				class: "text-gray-400 hover:text-white hover:bg-white/5",
			},
			{
				variant: "icon",
				color: "success",
				class: "text-success hover:bg-success/10 focus:bg-success/10 focus:ring-success/50",
			},
			{
				variant: "icon",
				color: "warning",
				class: "text-warning hover:bg-warning/10 focus:bg-warning/10 focus:ring-warning/50",
			},
			{
				variant: "icon",
				color: "error",
				class: "text-error hover:bg-error/10 focus:bg-error/10 focus:ring-error/50",
			},
		],
		defaultVariants: {
			variant: "solid",
			color: "primary",
			size: "md",
			fullWidth: false,
			loading: false,
		},
	}
);

export interface ButtonProps
	extends Omit<
			React.ButtonHTMLAttributes<HTMLButtonElement>,
			"color" | "disabled"
		>,
		Omit<VariantProps<typeof buttonVariants>, "loading" | "fullWidth"> {
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	children?: React.ReactNode;
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant,
			color,
			size,
			fullWidth,
			loading,
			leftIcon,
			rightIcon,
			children,
			className,
			disabled,
			...props
		},
		ref
	) => {
		// Loading spinner component
		const LoadingSpinner = () => (
			<svg
				className="animate-spin h-4 w-4"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24">
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

		return (
			<button
				ref={ref}
				className={cn(
					buttonVariants({
						variant,
						color,
						size,
						fullWidth,
						loading,
					}),
					className
				)}
				disabled={disabled || loading}
				{...props}>
				{loading && <LoadingSpinner />}
				{!loading && leftIcon && (
					<span className="flex-shrink-0">{leftIcon}</span>
				)}
				{children && (
					<span className={loading ? "opacity-75" : ""}>
						{children}
					</span>
				)}
				{!loading && rightIcon && (
					<span className="flex-shrink-0">{rightIcon}</span>
				)}
			</button>
		);
	}
);

Button.displayName = "Button";

export default Button;

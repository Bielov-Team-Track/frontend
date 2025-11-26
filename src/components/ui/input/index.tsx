"use client";

import { responsiveClasses } from "@/lib/utils/responsive";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import React, { forwardRef, useState } from "react";
import { FaExclamationCircle, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

// --- Utility Helper (If you import this from @/lib/utils, remove this block) ---
function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
// -------------------------------------------------------------------------------

// 1. Define Variants using CVA
const inputVariants = cva(
	// Base classes applied to all inputs
	// w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white/20
	"flex w-full rounded-md transition-colors duration-200 bg-background-light text-muted placeholder:text-muted/70 focus:outline-none border-white/5 focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-60 file:border-0 file:bg-transparent file:text-sm file:font-medium",
	{
		variants: {
			variant: {
				default:
					"border-input focus:border-white/10 focus:ring-primary/20",
				bordered:
					"border-base-content/20 focus:border-primary focus:ring-primary/20",
				ghost: "border-transparent bg-transparent shadow-none focus:bg-background-light",
			},
			inputSize: {
				sm: "h-8 text-mobile-sm sm:text-mobile-base px-3",
				md: "h-10 text-mobile-base sm:text-tablet-base lg:text-desktop-base px-3",
				lg: "h-12 text-mobile-base sm:text-tablet-base lg:text-desktop-lg px-4",
			},
			status: {
				default: "",
				error: "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500/20 placeholder:text-red-300",
			},
			fullWidth: {
				true: "w-full",
				false: "w-auto",
			},
		},
		defaultVariants: {
			variant: "bordered",
			inputSize: "md",
			status: "default",
			fullWidth: true,
		},
	}
);

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
		VariantProps<typeof inputVariants> {
	label?: string;
	error?: string;
	helperText?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	showPasswordToggle?: boolean;
	optional?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			variant,
			inputSize,
			fullWidth,
			status, // We derive this from 'error' prop usually, but exposing it allows manual override
			label,
			error,
			helperText,
			leftIcon,
			rightIcon,
			showPasswordToggle = false,
			type = "text",
			optional,
			disabled,
			required,
			...props
		},
		ref
	) => {
		const [showPassword, setShowPassword] = useState(false);

		// Determine final input type
		const isPasswordType = type === "password";
		const inputType = isPasswordType && showPassword ? "text" : type;
		const showToggle = isPasswordType && showPasswordToggle;

		// Determine effective status for CVA
		const effectiveStatus = error ? "error" : status;

		return (
			<div className={cn("form-control w-full", !fullWidth && "w-auto")}>
				{/* Label */}
				{label && (
					<label
						className={cn(
							"block font-medium mb-1.5",
							responsiveClasses.text.label,
							error && "text-red-600",
							disabled && "opacity-60"
						)}>
						{label}
						{required && (
							<span className="text-red-500 ml-1">*</span>
						)}
						{optional && !required && (
							<span className="text-muted ml-1 font-normal text-sm">
								optional
							</span>
						)}
					</label>
				)}

				{/* Helper Text (Top Position per original design) */}
				{helperText && !error && (
					<div className="mb-1">
						<span
							className={cn(
								responsiveClasses.text.caption,
								"text-primary-content/40 text-sm"
							)}>
							{helperText}
						</span>
					</div>
				)}

				{/* Input Container */}
				<div className="relative">
					{/* Left Icon */}
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
							{leftIcon}
						</div>
					)}

					<input
						ref={ref}
						type={inputType}
						disabled={disabled}
						className={cn(
							inputVariants({
								variant,
								inputSize,
								fullWidth,
								status: effectiveStatus,
							}),
							// Dynamic padding for icons
							leftIcon && "pl-10",
							(rightIcon || showToggle) && "pr-10",
							className
						)}
						{...props}
					/>

					{/* Right Icon or Password Toggle */}
					{(rightIcon || showToggle) && (
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
							{showToggle ? (
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="text-muted hover:text-foreground focus:outline-none transition-colors"
									tabIndex={-1}
									disabled={disabled}>
									{showPassword ? (
										<FaRegEyeSlash size={16} />
									) : (
										<FaRegEye size={16} />
									)}
								</button>
							) : (
								<span className="text-muted">{rightIcon}</span>
							)}
						</div>
					)}
				</div>

				{/* Error Message */}
				{error && (
					<div className="flex items-center gap-1 mt-1 text-red-600 animate-in slide-in-from-top-1 fade-in duration-200">
						<FaExclamationCircle size={12} />
						<span className={responsiveClasses.text.caption}>
							{error}
						</span>
					</div>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";

export default Input;

"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const inputVariants = cva(
	"flex w-full rounded-xl transition-all duration-200 text-white placeholder:text-muted/50 outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:ring-0 ring-transparent",
	{
		variants: {
			variant: {
				default:
					"bg-white/5 border border-white/10 focus:border-white/20 focus:bg-white/[0.07]",
				bordered:
					"bg-white/5 border border-white/10 focus:border-accent/50 focus:ring-0 focus:ring-accent/20",
				ghost: "border-transparent bg-transparent focus:bg-white/5",
			},
			inputSize: {
				sm: "h-9 text-sm px-3",
				md: "h-11 text-sm px-4",
				lg: "h-12 text-base px-4",
			},
			status: {
				default: "",
				error: "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5",
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
			status,
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

		const isPasswordType = type === "password";
		const inputType = isPasswordType && showPassword ? "text" : type;
		const showToggle = isPasswordType && showPasswordToggle;
		const effectiveStatus = error ? "error" : status;

		return (
			<div className={cn("form-control w-full", !fullWidth && "w-auto")}>
				{/* Label */}
				{label && (
					<label
						className={cn(
							"block text-sm font-medium text-white mb-2",
							error && "text-red-400",
							disabled && "opacity-50"
						)}>
						{label}
						{required && (
							<span className="text-red-400 ml-1">*</span>
						)}
						{optional && !required && (
							<span className="text-muted ml-1.5 font-normal text-xs">
								(optional)
							</span>
						)}
					</label>
				)}

				{/* Input Container */}
				<div className="relative">
					{/* Left Icon */}
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
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
							leftIcon && "pl-11",
							(rightIcon || showToggle) && "pr-11",
							className
						)}
						{...props}
					/>

					{/* Right Icon or Password Toggle */}
					{(rightIcon || showToggle) && (
						<div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
							{showToggle ? (
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="text-muted hover:text-white focus:outline-none transition-colors"
									tabIndex={-1}
									disabled={disabled}>
									{showPassword ? (
										<EyeOff size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							) : (
								<span className="text-muted">{rightIcon}</span>
							)}
						</div>
					)}
				</div>

				{/* Helper Text */}
				{helperText && !error && (
					<p className="mt-1.5 text-xs text-muted">{helperText}</p>
				)}

				{/* Error Message */}
				{error && (
					<div className="flex items-center gap-1.5 mt-1.5 text-red-400 animate-in slide-in-from-top-1 fade-in duration-200">
						<AlertCircle size={14} />
						<span className="text-xs">{error}</span>
					</div>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";

export default Input;

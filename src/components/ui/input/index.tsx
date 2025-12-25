"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useState } from "react";

type InputVariant = "default" | "bordered" | "ghost";
type InputSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	variant?: InputVariant;
	size?: InputSize;
	fullWidth?: boolean;
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
			variant = "bordered",
			size = "md",
			fullWidth = true,
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
			className,
			...props
		},
		ref
	) => {
		const [showPassword, setShowPassword] = useState(false);

		const isPasswordType = type === "password";
		const inputType = isPasswordType && showPassword ? "text" : type;
		const showToggle = isPasswordType && showPasswordToggle;

		// Map variant to DaisyUI style class
		const variantClass = {
			default: "",
			bordered: "",
			ghost: "input-ghost",
		}[variant];

		// Map size to DaisyUI size class
		const sizeClass = `input-${size}`;

		return (
			<div className={cn("form-control", fullWidth && "w-full")}>
				{/* Label */}
				{label && (
					<label className={cn("label", disabled && "opacity-50")}>
						<span className={cn("label-text", error && "text-error")}>
							{label}
							{required && <span className="text-error ml-1">*</span>}
							{optional && !required && <span className="text-base-content/50 ml-1.5 font-normal text-xs">(optional)</span>}
						</span>
					</label>
				)}

				{/* Input Container */}
				<div className="relative">
					{/* Left Icon */}
					{leftIcon && <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/50">{leftIcon}</div>}

					<input
						ref={ref}
						type={inputType}
						disabled={disabled}
						className={cn(
							"input rounded-2xl focus:outline-none focus:border-primary transition-all bg-base-300",
							sizeClass,
							variantClass,
							error && "input-error",
							fullWidth && "w-full",
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
									onClick={() => setShowPassword(!showPassword)}
									className="text-base-content/50 hover:text-base-content focus:outline-none transition-colors"
									tabIndex={-1}
									disabled={disabled}>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							) : (
								<span className="text-base-content/50">{rightIcon}</span>
							)}
						</div>
					)}
				</div>

				{/* Helper Text */}
				{helperText && !error && <p className="mt-1.5 text-xs text-base-content/50">{helperText}</p>}

				{/* Error Message */}
				{error && (
					<div className="flex items-center gap-1.5 mt-1.5 text-error animate-in slide-in-from-top-1 fade-in duration-200">
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

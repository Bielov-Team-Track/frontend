"use client";

import { responsiveClasses } from "@/lib/utils/responsive";
import React, { forwardRef, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";

export interface CheckboxProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
	label?: string;
	error?: string;
	helperText?: string;
	variant?: "default" | "bordered";
	color?:
		| "primary"
		| "secondary"
		| "accent"
		| "neutral"
		| "success"
		| "warning"
		| "error"
		| "info";
	checkboxSize?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	(
		{
			label,
			error,
			helperText,
			variant = "bordered",
			color = "primary",
			checkboxSize = "md",
			fullWidth = false,
			className = "",
			disabled,
			...props
		},
		ref
	) => {
		const [isFocused, setIsFocused] = useState(false);

		// Build CSS classes
		const baseClasses =
			"checkbox transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-[#141414]";

		const variantClasses = {
			default: "",
			bordered: "input-bordered border",
		};

		const colorClasses = {
			primary: "checkbox-primary",
			secondary: "checkbox-secondary",
			accent: "checkbox-accent",
			neutral: "checkbox-neutral",
			success: "checkbox-success",
			warning: "checkbox-warning",
			error: "checkbox-error",
			info: "checkbox-info",
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
			colorClasses[color],
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
				<label className="label cursor-pointer justify-start gap-2">
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
								error ? "text-red-600" : ""
							} ${disabled ? "opacity-60" : ""}`}>
							{label}
							{props.required && (
								<span className="text-red-500 ml-1">*</span>
							)}
						</span>
					)}
				</label>

				{/* Error Message */}
				{error && (
					<div className="flex items-center gap-1 mt-1 text-red-600">
						<FaExclamationCircle size={12} />
						<span className={responsiveClasses.text.caption}>
							{error}
						</span>
					</div>
				)}

				{/* Helper Text */}
				{helperText && !error && (
					<div>
						<span
							className={`${responsiveClasses.text.caption} text-muted text-sm`}>
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

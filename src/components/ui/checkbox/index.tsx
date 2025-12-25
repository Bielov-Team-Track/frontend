"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import React, { forwardRef } from "react";

type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";
type CheckboxColor = "primary" | "secondary" | "accent" | "neutral" | "success" | "warning" | "error";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
	label?: string;
	error?: string;
	helperText?: string;
	checkboxSize?: CheckboxSize;
	color?: CheckboxColor;
	fullWidth?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, error, helperText, checkboxSize = "md", color = "neutral", fullWidth = false, className = "", disabled, checked, ...props }, ref) => {
		// DaisyUI size classes
		const sizeClass = {
			xs: "checkbox-xs",
			sm: "checkbox-sm",
			md: "checkbox-md",
			lg: "checkbox-lg",
			xl: "checkbox-xl",
		}[checkboxSize];

		// DaisyUI color classes
		const colorClass = `checkbox-${error ? "error" : color}`;

		// Label text size based on checkbox size
		const labelSizeClass = {
			xs: "text-xs",
			sm: "text-sm",
			md: "text-sm",
			lg: "text-base",
			xl: "text-lg",
		}[checkboxSize];

		return (
			<div className={cn("form-control", fullWidth ? "w-full" : "w-auto")}>
				<label className={cn("label cursor-pointer justify-start gap-3", disabled && "opacity-50 cursor-not-allowed")}>
					<input
						ref={ref}
						type="checkbox"
						checked={checked}
						disabled={disabled}
						className={cn("checkbox", sizeClass, colorClass, className)}
						{...props}
					/>
					{(label || helperText) && (
						<div className="flex-1 min-w-0">
							{label && (
								<span className={cn("label-text", labelSizeClass, error && "text-error")}>
									{label}
									{props.required && <span className="text-error ml-1">*</span>}
								</span>
							)}
							{helperText && !error && <span className="block text-xs text-base-content/50 mt-0.5">{helperText}</span>}
						</div>
					)}
				</label>

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

Checkbox.displayName = "Checkbox";

export default Checkbox;

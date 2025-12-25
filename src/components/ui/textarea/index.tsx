"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import React, { forwardRef } from "react";

type TextAreaVariant = "default" | "bordered" | "ghost";
type TextAreaSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
	label?: string;
	error?: string;
	helperText?: string;
	variant?: TextAreaVariant;
	textAreaSize?: TextAreaSize;
	fullWidth?: boolean;
	maxLength?: number;
	showCharCount?: boolean;
	minRows?: number;
	maxRows?: number;
	optional?: boolean;
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
			required,
			value,
			optional,
			...props
		},
		ref
	) => {
		const characterCount = typeof value === "string" ? value.length : 0;

		// DaisyUI size classes
		const sizeClass = {
			xs: "textarea-xs",
			sm: "textarea-sm",
			md: "textarea-md",
			lg: "textarea-lg",
			xl: "textarea-xl",
		}[textAreaSize];

		// DaisyUI variant classes
		const variantClass = {
			default: "",
			bordered: "",
			ghost: "textarea-ghost",
		}[variant];

		// DaisyUI error state
		const errorClass = error ? "textarea-error" : "";

		const getRows = () => {
			if (props.rows) return props.rows;
			return Math.max(minRows, maxRows ? Math.min(minRows, maxRows) : minRows);
		};

		return (
			<div className={cn("form-control", fullWidth ? "w-full" : "w-auto")}>
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

				<div className="relative">
					<textarea
						ref={ref}
						disabled={disabled}
						maxLength={maxLength}
						rows={getRows()}
						value={value}
						className={cn(
							"textarea focus:outline-none focus:border-primary transition-all bg-base-300",
							sizeClass,
							variantClass,
							errorClass,
							fullWidth && "w-full",
							showCharCount && maxLength && "pb-8",
							className
						)}
						{...props}
					/>

					{/* Character count */}
					{showCharCount && maxLength && (
						<div className="absolute bottom-2 right-3 pointer-events-none">
							<span
								className={cn(
									"text-xs",
									characterCount >= maxLength ? "text-error" : characterCount > maxLength * 0.8 ? "text-warning" : "text-base-content/40"
								)}>
								{characterCount}/{maxLength}
							</span>
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

TextArea.displayName = "TextArea";

export default TextArea;

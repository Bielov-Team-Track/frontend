"use client";

import { AlertCircle } from "lucide-react";
import React, { forwardRef, useState } from "react";

export interface TextAreaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
	label?: string;
	error?: string;
	helperText?: string;
	variant?: "default" | "bordered" | "ghost";
	textAreaSize?: "sm" | "md" | "lg";
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
			value,
			optional,
			...props
		},
		ref
	) => {
		const [isFocused, setIsFocused] = useState(false);
		const characterCount = typeof value === "string" ? value.length : 0;

		const variantStyles = {
			default:
				"bg-white/5 border border-white/10 focus:border-white/20 focus:bg-white/[0.07]",
			bordered:
				"bg-white/5 border border-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/20",
			ghost: "border-transparent bg-transparent focus:bg-white/5",
		};

		const sizeStyles = {
			sm: "text-sm px-3 py-2",
			md: "text-sm px-4 py-3",
			lg: "text-base px-4 py-3",
		};

		const getRows = () => {
			if (props.rows) return props.rows;
			return Math.max(
				minRows,
				maxRows ? Math.min(minRows, maxRows) : minRows
			);
		};

		return (
			<div className={fullWidth ? "w-full" : "w-auto"}>
				{label && (
					<label
						className={`block text-sm font-medium mb-2 ${
							error ? "text-red-400" : "text-white"
						} ${disabled ? "opacity-50" : ""}`}>
						{label}
						{props.required && (
							<span className="text-red-400 ml-1">*</span>
						)}
						{optional && !props.required && (
							<span className="text-muted ml-1.5 font-normal text-xs">
								(optional)
							</span>
						)}
					</label>
				)}

				<div className="relative">
					<textarea
						ref={ref}
						className={`
							w-full rounded-xl transition-all duration-200 text-white
							placeholder:text-muted/50 focus:outline-none resize-y
							disabled:cursor-not-allowed disabled:opacity-50
							${variantStyles[variant]}
							${sizeStyles[textAreaSize]}
							${
								error
									? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
									: ""
							}
							${className}
						`}
						disabled={disabled}
						maxLength={maxLength}
						rows={getRows()}
						value={value}
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

					{/* Character count */}
					{showCharCount && maxLength && (
						<div className="absolute bottom-2 right-3 pointer-events-none">
							<span
								className={`text-xs ${
									characterCount >= maxLength
										? "text-red-400"
										: characterCount > maxLength * 0.8
										? "text-yellow-400"
										: "text-muted/50"
								}`}>
								{characterCount}/{maxLength}
							</span>
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

TextArea.displayName = "TextArea";

export default TextArea;

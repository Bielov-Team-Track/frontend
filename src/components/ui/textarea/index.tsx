"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import React, { forwardRef, useId } from "react";
import { Textarea as TextareaPrimitive } from "../textarea";
import { Label } from "../label";

export interface TextAreaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
	label?: string;
	error?: string;
	helperText?: string;
	maxLength?: number;
	showCharCount?: boolean;
	minRows?: number;
	optional?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
	(
		{
			label,
			error,
			helperText,
			maxLength,
			showCharCount = false,
			minRows = 3,
			className,
			disabled,
			required,
			value,
			optional,
			id: providedId,
			...props
		},
		ref
	) => {
		const generatedId = useId();
		const id = providedId || generatedId;
		const characterCount = typeof value === "string" ? value.length : 0;
		const hasError = Boolean(error);

		return (
			<div className="flex flex-col gap-1.5 w-full" data-disabled={disabled}>
				{/* Label */}
				{label && (
					<Label
						htmlFor={id}
						className={cn(hasError && "text-destructive")}
					>
						{label}
						{required && (
							<span className="text-destructive ml-1">*</span>
						)}
						{optional && !required && (
							<span className="text-muted-foreground ml-1.5 font-normal text-xs">
								(optional)
							</span>
						)}
					</Label>
				)}

				<div className="relative">
					<TextareaPrimitive
						ref={ref}
						id={id}
						disabled={disabled}
						maxLength={maxLength}
						rows={minRows}
						value={value}
						aria-invalid={hasError}
						aria-describedby={
							error ? `${id}-error` : helperText ? `${id}-helper` : undefined
						}
						className={cn(
							hasError && "border-destructive focus-visible:ring-destructive/30",
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
									characterCount >= maxLength
										? "text-destructive"
										: characterCount > maxLength * 0.8
											? "text-warning"
											: "text-muted-foreground"
								)}
							>
								{characterCount}/{maxLength}
							</span>
						</div>
					)}
				</div>

				{/* Helper Text */}
				{helperText && !error && (
					<p id={`${id}-helper`} className="text-xs text-muted-foreground">
						{helperText}
					</p>
				)}

				{/* Error Message */}
				{error && (
					<div
						id={`${id}-error`}
						role="alert"
						className="flex items-center gap-1.5 text-destructive"
					>
						<AlertCircle size={14} className="shrink-0" />
						<span className="text-xs">{error}</span>
					</div>
				)}
			</div>
		);
	}
);

TextArea.displayName = "TextArea";

export { TextArea };
export default TextArea;

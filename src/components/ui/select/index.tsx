"use client";

import React, { forwardRef, useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../label";

export interface SelectOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

export interface SelectProps
	extends Omit<
		React.SelectHTMLAttributes<HTMLSelectElement>,
		"size" | "onChange"
	> {
	label?: string;
	error?: string;
	helperText?: string;
	options: SelectOption[];
	placeholder?: string;
	leftIcon?: React.ReactNode;
	value?: string | number;
	onChange?: (value: string | number | undefined) => void;
	clearable?: boolean;
	optional?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			label,
			error,
			helperText,
			options,
			placeholder,
			leftIcon,
			className,
			disabled,
			value,
			onChange,
			clearable = false,
			optional,
			id: providedId,
			...props
		},
		ref
	) => {
		const generatedId = useId();
		const id = providedId || generatedId;
		const hasError = Boolean(error);
		const displayValue = value ?? "";

		const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
			const newValue = e.target.value;
			if (onChange) {
				onChange(newValue === "" ? undefined : newValue);
			}
		};

		return (
			<div className="flex flex-col gap-1.5 w-full" data-disabled={disabled}>
				{/* Label */}
				{label && (
					<Label
						htmlFor={id}
						className={cn(hasError && "text-destructive")}
					>
						{label}
						{props.required && (
							<span className="text-destructive ml-1">*</span>
						)}
						{optional && !props.required && (
							<span className="text-muted-foreground ml-1.5 font-normal text-xs">
								(optional)
							</span>
						)}
					</Label>
				)}

				<div className="relative">
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
							{leftIcon}
						</div>
					)}

					<select
						ref={ref}
						id={id}
						disabled={disabled}
						value={displayValue}
						onChange={handleChange}
						aria-invalid={hasError}
						aria-describedby={
							error ? `${id}-error` : helperText ? `${id}-helper` : undefined
						}
						className={cn(
							// Base styles matching Input
							"flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-base transition-colors md:text-sm appearance-none cursor-pointer",
							// Border & focus
							"border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							// Disabled
							"disabled:cursor-not-allowed disabled:opacity-50",
							// Error state
							hasError && "border-destructive focus-visible:ring-destructive/30",
							// Icon padding
							leftIcon && "pl-10",
							// Right padding for chevron
							"pr-10",
							className
						)}
						{...props}
					>
						<option value="" disabled>
							{placeholder || (clearable ? "-- Clear --" : "-- Select --")}
						</option>
						{options.map((option) => (
							<option
								key={option.value}
								value={option.value}
								disabled={option.disabled}
							>
								{option.label}
							</option>
						))}
					</select>

					{/* Chevron icon */}
					<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
						<ChevronDown size={16} />
					</div>
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

Select.displayName = "Select";

export { Select };
export default Select;

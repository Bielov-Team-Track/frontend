"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import React, { useId } from "react";
import { Label } from "../label";
import { SelectContent, SelectItem, Select as SelectRoot, SelectTrigger, SelectValue } from "../select";

export interface SelectOption<T = any> {
	value: string;
	label: string;
	data?: T;
	disabled?: boolean;
}

export interface SelectProps<T = any> {
	label?: string;
	inlineLabel?: string;
	error?: string;
	helperText?: string;
	options: SelectOption<T>[];
	placeholder?: string;
	leftIcon?: React.ReactNode;
	value?: string;
	onChange?: (value: string | undefined) => void;
	clearable?: boolean;
	disabled?: boolean;
	required?: boolean;
	className?: string;
	id?: string;
	name?: string;
	fullWidth?: boolean;
	renderOption?: (option: SelectOption<T>) => React.ReactNode;
	renderValue?: (option: SelectOption<T>) => React.ReactNode;
}

function Select<T = any>({
	label,
	inlineLabel,
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
	fullWidth = false,
	required,
	id: providedId,
	name,
	renderOption,
	renderValue,
}: SelectProps<T>) {
	const generatedId = useId();
	const id = providedId || generatedId;
	const hasError = Boolean(error);

	const handleValueChange = (newValue: string | null) => {
		if (onChange) {
			onChange(newValue === null ? undefined : newValue);
		}
	};

	const selectedOption = options.find((opt) => opt.value === value);

	return (
		<div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "")} data-disabled={disabled}>
			{label && (
				<Label htmlFor={id} className={cn(hasError && "text-destructive")}>
					{label}
					{required && <span className="text-destructive">*</span>}
				</Label>
			)}

			<SelectRoot value={value || null} onValueChange={handleValueChange} disabled={disabled} name={name}>
				<SelectTrigger
					id={id}
					className={cn("w-full", hasError && "border-destructive focus-visible:ring-destructive/30 aria-invalid:border-destructive", className)}
					aria-invalid={hasError}
					aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}>
					{leftIcon && !inlineLabel && <span className="text-muted-foreground mr-1">{leftIcon}</span>}
					{inlineLabel && (
						<div className="text-muted-foreground bg-surface-elevated -ml-2.5 -my-2 px-2.5 py-2 mr-2 rounded-l-lg text-xs flex gap-1">
							{leftIcon && <span className="text-muted-foreground mr-1">{leftIcon}</span>} {inlineLabel}
						</div>
					)}
					<SelectValue>
						{(selectedValue: string | null) =>
							selectedValue && selectedOption ? (
								renderValue ? (
									renderValue(selectedOption)
								) : (
									selectedOption.label
								)
							) : (
								<span className="text-muted-foreground">{placeholder || "Select an option"}</span>
							)
						}
					</SelectValue>
				</SelectTrigger>
				<SelectContent className={"shadow-md shadow-black"}>
					{clearable && (
						<SelectItem value={undefined}>
							<span className="text-muted-foreground">Clear selection</span>
						</SelectItem>
					)}
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value} disabled={option.disabled}>
							{renderOption ? renderOption(option) : option.label}
						</SelectItem>
					))}
				</SelectContent>
			</SelectRoot>

			{helperText && !error && (
				<p id={`${id}-helper`} className="text-xs text-muted-foreground">
					{helperText}
				</p>
			)}

			{error && (
				<div id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-destructive">
					<AlertCircle size={14} className="shrink-0" />
					<span className="text-xs">{error}</span>
				</div>
			)}
		</div>
	);
}

Select.displayName = "Select";

export { Select };
export default Select;

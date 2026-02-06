"use client";

import React from "react";
import RadioButton, { RadioButtonProps } from "./index";
import { AlertCircle } from "lucide-react";
import { responsiveClasses } from "@/lib/utils/responsive";

export interface RadioGroupOption {
	value: string;
	label?: string;
	icon?: React.ComponentType<{ className?: string; size?: number }>;
	disabled?: boolean;
}

export interface RadioGroupProps {
	/** Name attribute for the radio group */
	name: string;
	/** Current selected value */
	value?: string;
	/** Callback when selection changes */
	onChange?: (value: string) => void;
	/** Array of radio options */
	options: readonly RadioGroupOption[];
	/** Display mode for all radio buttons */
	mode?: "icon" | "label" | "both";
	/** Size variant */
	radioSize?: "sm" | "md" | "lg";
	/** Color variant */
	variant?:
		| "primary"
		| "secondary"
		| "accent"
		| "neutral"
		| "success"
		| "warning"
		| "error";
	/** Label for the entire group */
	label?: string;
	/** Error message */
	error?: string;
	/** Helper text */
	helperText?: string;
	/** Whether the group is disabled */
	disabled?: boolean;
	/** Layout direction */
	direction?: "horizontal" | "vertical";
	/** Additional CSS classes for the container */
	className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
	name,
	value,
	onChange,
	options,
	mode = "label",
	radioSize = "md",
	variant = "primary",
	label,
	error,
	helperText,
	disabled = false,
	direction = "horizontal",
	className = "",
}) => {
	const handleChange = (newValue: string) => {
		if (onChange && !disabled) {
			onChange(newValue);
		}
	};

	const groupClasses = [
		"flex",
		direction === "horizontal" ? "gap-2 flex-wrap" : "flex-col gap-2",
		className,
	]
		.filter(Boolean)
		.join(" ");

	const labelClasses = [
		"block font-medium mb-2",
		responsiveClasses.text.label,
		error ? "text-red-600" : "",
		disabled ? "opacity-60" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className="form-control">
			{label && <label className={labelClasses}>{label}</label>}

			{/* Helper Text */}
			{helperText && !error && (
				<div className="mb-2">
					<span
						className={`${responsiveClasses.text.caption} text-base-content/60 text-sm`}
					>
						{helperText}
					</span>
				</div>
			)}

			<div className={groupClasses}>
				{options.map((option) => (
					<RadioButton
						key={option.value}
						name={name}
						value={option.value}
						label={option.label}
						icon={option.icon}
						mode={mode}
						radioSize={radioSize}
						color={variant}
						checked={value === option.value}
						disabled={disabled || option.disabled}
						onChange={() => handleChange(option.value)}
					/>
				))}
			</div>

			{/* Error Message */}
			{error && (
				<div className="flex items-center gap-1 mt-2 text-red-600">
					<AlertCircle size={12} />
					<span className={responsiveClasses.text.caption}>{error}</span>
				</div>
			)}
		</div>
	);
};

export default RadioGroup;

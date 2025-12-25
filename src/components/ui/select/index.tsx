import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
	value: string | number;
	label: string;
	icon?: React.ReactNode;
	disabled?: boolean;
}

type SelectSize = "xs" | "sm" | "md" | "lg" | "xl";
type SelectVariant = "default" | "bordered" | "ghost";

export interface SelectProps
	extends Omit<
		React.SelectHTMLAttributes<HTMLSelectElement>,
		"size" | "onChange"
	> {
	label?: string;
	error?: string;
	helperText?: string;
	variant?: SelectVariant;
	selectSize?: SelectSize;
	fullWidth?: boolean;
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
			variant = "bordered",
			selectSize = "md",
			fullWidth = true,
			options,
			placeholder,
			leftIcon,
			className = "",
			disabled,
			value,
			onChange,
			clearable = false,
			optional,
			...props
		},
		ref,
	) => {
		// DaisyUI size classes
		const sizeClass = {
			xs: "select-xs",
			sm: "select-sm",
			md: "select-md",
			lg: "select-lg",
			xl: "select-xl",
		}[selectSize];

		// DaisyUI variant classes
		const variantClass = {
			default: "",
			bordered: "",
			ghost: "select-ghost",
		}[variant];

		// DaisyUI error state
		const errorClass = error ? "select-error" : "";

		// Handle change event
		const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
			const newValue = e.target.value;
			if (onChange) {
				onChange(newValue === "" ? undefined : newValue);
			}
		};

		const displayValue = value ?? "";

		return (
			<div className={cn("form-control", fullWidth ? "w-full" : "w-auto")}>
				{label && (
					<label className={cn("label", disabled && "opacity-50")}>
						<span className={cn("label-text", error && "text-error")}>
							{label}
							{props.required && <span className="text-error ml-1">*</span>}
							{optional && !props.required && <span className="text-base-content/50 ml-1.5 font-normal text-xs">(optional)</span>}
						</span>
					</label>
				)}

				<div className="relative">
					{leftIcon && (
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-base-content/50">
							{leftIcon}
						</div>
					)}

					<select
						ref={ref}
						className={cn(
							"select",
							sizeClass,
							variantClass,
							errorClass,
							fullWidth && "w-full",
							leftIcon && "pl-10",
							className
						)}
						disabled={disabled}
						value={displayValue}
						onChange={handleChange}
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
				</div>

				{helperText && !error && <p className="mt-1.5 text-xs text-base-content/50">{helperText}</p>}

				{error && (
					<div className="flex items-center gap-1.5 mt-1.5 text-error animate-in slide-in-from-top-1 fade-in duration-200">
						<AlertCircle size={14} />
						<span className="text-xs">{error}</span>
					</div>
				)}
			</div>
		);
	},
);

Select.displayName = "Select";

export default Select;

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import React, { forwardRef } from "react";

type RangeSize = "xs" | "sm" | "md" | "lg" | "xl";
type RangeColor = "primary" | "secondary" | "accent" | "neutral" | "success" | "warning" | "error";

export interface SliderProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "color"> {
	label?: string;
	error?: string;
	helperText?: string;
	optional?: boolean;
	showValue?: boolean;
	formatValue?: (value: number) => string;
	alternativeValues?: Array<(value: number) => string>;
	color?: RangeColor;
	sliderSize?: RangeSize;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
	(
		{
			className,
			color = "primary",
			sliderSize = "md",
			label,
			error,
			helperText,
			optional,
			disabled,
			required,
			showValue = true,
			formatValue,
			alternativeValues,
			min = 0,
			max = 100,
			step = 1,
			value,
			...props
		},
		ref
	) => {
		// DaisyUI size classes
		const sizeClass = {
			xs: "range-xs",
			sm: "range-sm",
			md: "range-md",
			lg: "range-lg",
			xl: "range-xl",
		}[sliderSize];

		// DaisyUI color classes
		const colorClass = `range-${error ? "error" : color}`;

		const displayValue = formatValue ? formatValue(Number(value)) : value;

		return (
			<div className="form-control w-full">
				{/* Label and Value */}
				{(label || showValue) && (
					<div className="flex justify-between items-end mb-2">
						{label && (
							<label className={cn("label-text", error && "text-error", disabled && "opacity-50")}>
								{label}
								{required && <span className="text-error ml-1">*</span>}
								{optional && !required && (
									<span className="text-base-content/50 ml-1.5 font-normal text-xs">(optional)</span>
								)}
							</label>
						)}
						{showValue && (
							<div className="flex items-end gap-1">
								<span className="text-sm font-medium">{displayValue}</span>
								{alternativeValues?.map((fn, index) => (
									<span key={index} className="text-sm text-base-content/50">
										/ {fn(Number(value))}
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* DaisyUI Range Input */}
				<input
					ref={ref}
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					disabled={disabled}
					className={cn("range", sizeClass, colorClass, className)}
					{...props}
				/>

				{/* Helper Text */}
				{helperText && !error && (
					<p className="mt-1.5 text-xs text-base-content/50">{helperText}</p>
				)}

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

Slider.displayName = "Slider";

export default Slider;

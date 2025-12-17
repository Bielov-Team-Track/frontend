import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { AlertCircle } from "lucide-react";
import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const sliderVariants = cva(
	"w-full appearance-none bg-white/10 rounded-full outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-white/5",
	{
		variants: {
			variant: {
				default: "",
			},
			color: {
				primary:
					"[&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:hover:bg-primary/90 [&::-moz-range-thumb]:hover:bg-primary/90",
				secondary:
					"[&::-webkit-slider-thumb]:bg-secondary [&::-moz-range-thumb]:bg-secondary [&::-webkit-slider-thumb]:hover:bg-secondary/90 [&::-moz-range-thumb]:hover:bg-secondary/90",
				accent: "[&::-webkit-slider-thumb]:bg-accent [&::-moz-range-thumb]:bg-accent [&::-webkit-slider-thumb]:hover:bg-accent/90 [&::-moz-range-thumb]:hover:bg-accent/90",
				neutral:
					"[&::-webkit-slider-thumb]:bg-muted [&::-moz-range-thumb]:bg-muted [&::-webkit-slider-thumb]:hover:bg-white [&::-moz-range-thumb]:hover:bg-white",
				success:
					"[&::-webkit-slider-thumb]:bg-success [&::-moz-range-thumb]:bg-success [&::-webkit-slider-thumb]:hover:bg-success/90 [&::-moz-range-thumb]:hover:bg-success/90",
				warning:
					"[&::-webkit-slider-thumb]:bg-warning [&::-moz-range-thumb]:bg-warning [&::-webkit-slider-thumb]:hover:bg-warning/90 [&::-moz-range-thumb]:hover:bg-warning/90",
				error: "[&::-webkit-slider-thumb]:bg-error [&::-moz-range-thumb]:bg-error [&::-webkit-slider-thumb]:hover:bg-error/90 [&::-moz-range-thumb]:hover:bg-error/90",
			},
			sliderSize: {
				xs: "h-1 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3",
				sm: "h-1.5 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
				md: "h-2 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",
				lg: "h-3 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6",
			},
		},
		defaultVariants: {
			variant: "default",
			color: "primary",
			sliderSize: "sm",
		},
	}
);

// Add base thumb styles that are common
const thumbBaseStyles =
	"[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-95 " +
	"[&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:scale-95";

export interface SliderProps
	extends Omit<
			React.InputHTMLAttributes<HTMLInputElement>,
			"size" | "type" | "color"
		>,
		VariantProps<typeof sliderVariants> {
	label?: string;
	error?: string;
	helperText?: string;
	optional?: boolean;
	showValue?: boolean;
	formatValue?: (value: number) => string;
	alternativeValues?: Array<(value: number) => string>;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
	(
		{
			className,
			variant,
			color,
			sliderSize,
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
		const effectiveColor = error ? "error" : color;

		const displayValue = formatValue ? formatValue(Number(value)) : value;

		return (
			<div className="form-control w-full">
				{/* Label and Value */}
				{(label || showValue) && (
					<div className="flex justify-between items-end mb-2">
						{label && (
							<label
								className={cn(
									"block text-sm font-medium text-white",
									error && "text-red-400",
									disabled && "opacity-50"
								)}>
								{label}
								{required && (
									<span className="text-red-400 ml-1">*</span>
								)}
								{optional && !required && (
									<span className="text-muted ml-1.5 font-normal text-xs">
										(optional)
									</span>
								)}
							</label>
						)}
						{showValue && (
							<div className="flex items-end gap-1">
								<span className="text-sm font-medium text-white">
									{displayValue}
								</span>
								{alternativeValues?.map((fn, index) => (
									<span
										key={index}
										className="text-sm text-muted">
										/ {fn(Number(value))}
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Slider Input */}
				<input
					ref={ref}
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					disabled={disabled}
					className={cn(
						sliderVariants({
							variant,
							color: effectiveColor,
							sliderSize,
						}),
						thumbBaseStyles,
						className
					)}
					{...props}
				/>

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

Slider.displayName = "Slider";

export default Slider;

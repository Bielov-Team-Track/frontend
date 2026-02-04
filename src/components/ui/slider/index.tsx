"use client";

import { cn } from "@/lib/utils";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { AlertCircle, X } from "lucide-react";
import { forwardRef, useId, useMemo } from "react";
import { Label } from "../label";

type SliderSize = "sm" | "md" | "lg";
type SliderVariant = "default" | "muted" | "outline";
type SliderColor = "primary" | "secondary" | "accent" | "success" | "warning" | "error";

export interface SliderProps {
	/** Label text displayed above the slider */
	label?: string;
	/** Error message - shows in destructive color */
	error?: string;
	/** Helper text shown below the slider */
	helperText?: string;
	/** Shows "(optional)" indicator next to label */
	optional?: boolean;
	/** Shows "*" indicator next to label */
	required?: boolean;
	/** Whether to show the current value(s) */
	showValue?: boolean;
	/** Custom formatter for displayed value(s) */
	formatValue?: (value: number) => string;
	/** Additional value formatters shown after main value (e.g., unit conversions) */
	alternativeValues?: Array<(value: number) => string>;
	/** Visual variant - default (colored), muted (neutral), or outline */
	variant?: SliderVariant;
	/** Color theme for the slider (applies to default variant) */
	color?: SliderColor;
	/** Size variant */
	size?: SliderSize;
	/** Minimum value */
	min?: number;
	/** Maximum value */
	max?: number;
	/** Step increment */
	step?: number;
	/** Single value (controlled) - null means no value selected */
	value?: number | null;
	/** Range values as tuple [min, max] (controlled) */
	rangeValue?: [number, number];
	/** Default single value (uncontrolled) */
	defaultValue?: number;
	/** Default range values (uncontrolled) */
	defaultRangeValue?: [number, number];
	/** Whether the slider is disabled */
	disabled?: boolean;
	/** Whether the value can be cleared (shows X button) */
	clearable?: boolean;
	/** Placeholder text shown when value is null */
	placeholder?: string;
	/** Additional CSS classes */
	className?: string;
	/** ID for the slider element */
	id?: string;
	/** Callback for single value change (react-hook-form compatible) - value is null when cleared */
	onChange?: (event: { target: { value: number | null } }) => void;
	/** Direct callback for single value change */
	onValueChange?: (value: number | null) => void;
	/** Callback for range value change */
	onRangeChange?: (values: [number, number]) => void;
}

const sizeStyles: Record<SliderSize, { track: string; thumb: string }> = {
	sm: {
		track: "h-1",
		thumb: "size-3",
	},
	md: {
		track: "h-1.5",
		thumb: "size-4",
	},
	lg: {
		track: "h-2",
		thumb: "size-5",
	},
};

// Variant styles - controls overall appearance
const variantStyles: Record<SliderVariant, { track: string; indicator: string; thumb: string }> = {
	default: {
		track: "bg-track",
		indicator: "", // Color applied separately
		thumb: "bg-background border-2",
	},
	muted: {
		track: "bg-track",
		indicator: "bg-foreground/30",
		thumb: "bg-foreground/80 border-0 hover:bg-foreground focus-visible:bg-foreground",
	},
	outline: {
		track: "bg-track",
		indicator: "", // Color applied separately
		thumb: "bg-background border-2 shadow-md",
	},
};

// Color styles - applies to default and outline variants
const colorStyles: Record<SliderColor, { indicator: string; thumb: string }> = {
	primary: {
		indicator: "bg-primary",
		thumb: "border-primary hover:ring-primary/30 focus-visible:ring-primary/30 active:ring-primary/30",
	},
	secondary: {
		indicator: "bg-secondary",
		thumb: "border-secondary hover:ring-secondary/30 focus-visible:ring-secondary/30 active:ring-secondary/30",
	},
	accent: {
		indicator: "bg-accent",
		thumb: "border-accent hover:ring-accent/30 focus-visible:ring-accent/30 active:ring-accent/30",
	},
	success: {
		indicator: "bg-success",
		thumb: "border-success hover:ring-success/30 focus-visible:ring-success/30 active:ring-success/30",
	},
	warning: {
		indicator: "bg-warning",
		thumb: "border-warning hover:ring-warning/30 focus-visible:ring-warning/30 active:ring-warning/30",
	},
	error: {
		indicator: "bg-destructive",
		thumb: "border-destructive hover:ring-destructive/30 focus-visible:ring-destructive/30 active:ring-destructive/30",
	},
};

// Muted variant has its own thumb ring style
const mutedThumbRing = "hover:ring-foreground/10 focus-visible:ring-foreground/10 active:ring-foreground/10";

const Slider = forwardRef<HTMLDivElement, SliderProps>(
	(
		{
			className,
			variant = "default",
			color = "primary",
			size = "md",
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
			rangeValue,
			defaultValue,
			defaultRangeValue,
			clearable = false,
			placeholder = "Not set",
			onChange,
			onValueChange,
			onRangeChange,
			id: providedId,
		},
		ref
	) => {
		const generatedId = useId();
		const id = providedId || generatedId;
		const hasError = Boolean(error);
		const effectiveColor = hasError ? "error" : color;
		const sizeStyle = sizeStyles[size];
		const variantStyle = variantStyles[variant];
		const colorStyle = colorStyles[effectiveColor];
		const isMuted = variant === "muted";

		// Determine if this is a range slider
		const isRange = rangeValue !== undefined || defaultRangeValue !== undefined;

		// Check if value is null/empty (only for single value mode)
		const hasValue = isRange ? true : value !== null && value !== undefined;

		// Get current values for display
		const currentValues = useMemo(() => {
			if (rangeValue !== undefined) return rangeValue;
			if (value !== undefined && value !== null) return [value];
			if (defaultRangeValue !== undefined) return defaultRangeValue;
			if (defaultValue !== undefined) return [defaultValue];
			return isRange ? [min, max] : [min];
		}, [rangeValue, value, defaultRangeValue, defaultValue, isRange, min, max]);

		// Format a single value for display
		const formatDisplayValue = (val: number) => {
			return formatValue ? formatValue(val) : val.toString();
		};

		// Handle clearing the value
		const handleClear = () => {
			if (disabled) return;
			onChange?.({ target: { value: null } });
			onValueChange?.(null);
		};

		// Render value display
		const renderValueDisplay = () => {
			if (!showValue) return null;

			// Show placeholder when no value
			if (!hasValue) {
				return (
					<span className="text-sm text-muted-foreground">{placeholder}</span>
				);
			}

			if (isRange) {
				const [minVal, maxVal] = currentValues as [number, number];
				return (
					<div className="flex items-baseline gap-1">
						<span className={cn("text-sm font-semibold tabular-nums", hasError ? "text-destructive" : "text-foreground")}>
							{formatDisplayValue(minVal)}
						</span>
						<span className="text-xs text-muted-foreground">–</span>
						<span className={cn("text-sm font-semibold tabular-nums", hasError ? "text-destructive" : "text-foreground")}>
							{formatDisplayValue(maxVal)}
						</span>
						{alternativeValues?.map((fn, index) => (
							<span key={index} className="text-xs text-muted-foreground ml-1">
								({fn(minVal)} – {fn(maxVal)})
							</span>
						))}
					</div>
				);
			}

			const singleValue = currentValues[0];
			return (
				<div className="flex items-center gap-1.5">
					<span className={cn("text-sm font-semibold tabular-nums", hasError ? "text-destructive" : "text-foreground")}>
						{formatDisplayValue(singleValue)}
					</span>
					{alternativeValues?.map((fn, index) => (
						<span key={index} className="text-xs text-muted-foreground">
							/ {fn(singleValue)}
						</span>
					))}
					{clearable && !disabled && (
						<button
							type="button"
							onClick={handleClear}
							className="ml-1 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							aria-label="Clear value"
						>
							<X size={14} />
						</button>
					)}
				</div>
			);
		};

		// Handle value changes from the primitive
		const handleValueChange = (newValues: number | number[]) => {
			const values = Array.isArray(newValues) ? newValues : [newValues];

			if (isRange && values.length === 2) {
				onRangeChange?.(values as [number, number]);
			} else {
				const singleValue = values[0];
				onChange?.({ target: { value: singleValue } });
				onValueChange?.(singleValue);
			}
		};

		// Compute controlled/default values for the primitive
		// When value is null, we still need to provide a value for the primitive to render
		const primitiveValue = useMemo(() => {
			if (rangeValue !== undefined) return rangeValue;
			if (value !== undefined && value !== null) return [value];
			// When null, use middle of range as visual position
			if (value === null) return [Math.round((min + max) / 2)];
			return undefined;
		}, [rangeValue, value, min, max]);

		const primitiveDefaultValue = useMemo(() => {
			if (defaultRangeValue !== undefined) return defaultRangeValue;
			if (defaultValue !== undefined) return [defaultValue];
			return isRange ? [min, max] : [Math.round((min + max) / 2)];
		}, [defaultRangeValue, defaultValue, isRange, min, max]);

		const thumbCount = isRange ? 2 : 1;

		return (
			<div ref={ref} className={cn("flex flex-col gap-1.5 w-full", className)} data-disabled={disabled}>
				{/* Label and Value */}
				{(label || showValue) && (
					<div className="flex justify-between items-center">
						{label && (
							<Label htmlFor={id} className={cn(hasError && "text-destructive", "gap-1")}>
								{label}
								{required && <span className="text-destructive">*</span>}
							</Label>
						)}
						{showValue && renderValueDisplay()}
					</div>
				)}

				{/* Slider */}
				<SliderPrimitive.Root
					id={id}
					min={min}
					max={max}
					step={step}
					value={primitiveValue}
					defaultValue={primitiveDefaultValue}
					disabled={disabled}
					onValueChange={handleValueChange}
					aria-invalid={hasError}
					aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
					className="relative flex w-full touch-none select-none items-center py-1">
					<SliderPrimitive.Control className="relative flex w-full items-center data-disabled:opacity-50 data-disabled:cursor-not-allowed">
						<SliderPrimitive.Track className={cn("relative w-full overflow-hidden rounded-full", variantStyle.track, sizeStyle.track)}>
							<SliderPrimitive.Indicator className={cn("h-full", isMuted ? variantStyle.indicator : colorStyle.indicator)} />
						</SliderPrimitive.Track>
						{Array.from({ length: thumbCount }, (_, index) => (
							<SliderPrimitive.Thumb
								key={index}
								className={cn(
									"block rounded-full shadow-sm cursor-grab active:cursor-grabbing",
									"ring-offset-background focus-visible:outline-none transition-shadow",
									"hover:ring-4 focus-visible:ring-4 active:ring-4",
									"disabled:pointer-events-none disabled:opacity-50",
									sizeStyle.thumb,
									variantStyle.thumb,
									isMuted ? mutedThumbRing : colorStyle.thumb
								)}
							/>
						))}
					</SliderPrimitive.Control>
				</SliderPrimitive.Root>

				{/* Helper Text */}
				{helperText && !error && (
					<p id={`${id}-helper`} className="text-xs text-muted-foreground">
						{helperText}
					</p>
				)}

				{/* Error Message */}
				{error && (
					<div id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-destructive">
						<AlertCircle size={14} className="shrink-0" />
						<span className="text-xs">{error}</span>
					</div>
				)}
			</div>
		);
	}
);

Slider.displayName = "Slider";

export { Slider };
export default Slider;

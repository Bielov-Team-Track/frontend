"use client";

import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

type RadioSize = "xs" | "sm" | "md" | "lg" | "xl";
type RadioColor = "primary" | "secondary" | "accent" | "neutral" | "success" | "warning" | "error";

export interface RadioButtonProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
	/** The value of this radio button */
	value: string;
	/** Label text */
	label?: string;
	/** Icon component (for icon mode) */
	icon?: React.ComponentType<{ className?: string; size?: number }>;
	/** Display mode: icon, label, or both */
	mode?: "icon" | "label" | "both";
	/** Size variant */
	radioSize?: RadioSize;
	/** Color variant */
	color?: RadioColor;
	/** Additional CSS classes */
	className?: string;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
	(
		{
			value,
			label,
			icon: Icon,
			mode = "label",
			radioSize = "md",
			color = "primary",
			className = "",
			disabled = false,
			checked,
			...props
		},
		ref,
	) => {
		// DaisyUI size classes
		const sizeClass = {
			xs: "radio-xs",
			sm: "radio-sm",
			md: "radio-md",
			lg: "radio-lg",
			xl: "radio-xl",
		}[radioSize];

		// DaisyUI color classes
		const colorClass = `radio-${color}`;

		// Icon sizes based on radio size
		const iconSize = {
			xs: 12,
			sm: 14,
			md: 16,
			lg: 20,
			xl: 24,
		}[radioSize];

		// Label text size based on radio size
		const labelSizeClass = {
			xs: "text-xs",
			sm: "text-sm",
			md: "text-sm",
			lg: "text-base",
			xl: "text-lg",
		}[radioSize];

		return (
			<label className={cn("label cursor-pointer justify-start gap-3", disabled && "opacity-50 cursor-not-allowed", className)}>
				<input
					ref={ref}
					type="radio"
					value={value}
					checked={checked}
					disabled={disabled}
					className={cn("radio", sizeClass, colorClass)}
					{...props}
				/>
				{mode === "icon" && Icon && <Icon size={iconSize} />}
				{mode === "label" && label && <span className={cn("label-text", labelSizeClass)}>{label}</span>}
				{mode === "both" && (
					<span className={cn("label-text flex items-center gap-2", labelSizeClass)}>
						{Icon && <Icon size={iconSize} />}
						{label}
					</span>
				)}
			</label>
		);
	},
);

RadioButton.displayName = "RadioButton";

export default RadioButton;

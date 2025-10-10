"use client";

import React, { forwardRef } from "react";
import { responsiveClasses } from "@/lib/utils/responsive";

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
			variant = "primary",
			className = "",
			disabled = false,
			checked,
			...props
		},
		ref,
	) => {
		// Base classes for the label container
		const baseClasses =
			"inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer " +
			"disabled:opacity-60 disabled:cursor-not-allowed";

		// Color scheme classes
		const colorClasses = {
			primary: {
				checked: "bg-primary text-primary-content border-primary shadow-md",
				unchecked:
					"border-base-300 bg-base-100 hover:bg-base-200 text-base-content hover:border-primary/50",
			},
			secondary: {
				checked:
					"bg-secondary text-secondary-content border-secondary shadow-md",
				unchecked:
					"border-base-300 bg-base-100 hover:bg-base-200 text-base-content hover:border-secondary/50",
			},
			accent: {
				checked: "bg-accent text-accent-content border-accent shadow-md",
				unchecked:
					"border-base-300 bg-base-100 hover:bg-base-200 text-base-content hover:border-accent/50",
			},
			neutral: {
				checked: "bg-white/10 text-neutral-content shadow-md",
				unchecked:
					"hover:bg-white/10 text-base-content hover:border-neutral/50",
			},
			success: {
				checked: "bg-success text-success-content border-success shadow-md",
				unchecked:
					"border-base-300 bg-base-100 hover:bg-base-200 text-base-content hover:border-success/50",
			},
			warning: {
				checked: "bg-warning text-warning-content border-warning shadow-md",
				unchecked:
					"border-base-300 bg-base-100 hover:bg-base-200 text-base-content hover:border-warning/50",
			},
			error: {
				checked: "bg-error text-error-content border-error shadow-md",
				unchecked:
					"border-base-300 bg-base-100 hover:bg-base-200 text-base-content hover:border-error/50",
			},
		};

		// Size classes
		const sizeClasses = {
			sm: {
				container: "px-3 py-1.5 gap-1.5 text-mobile-sm sm:text-mobile-base",
				icon: 16,
			},
			md: {
				container:
					"px-4 py-2 gap-2 text-mobile-base sm:text-tablet-base lg:text-desktop-base",
				icon: 20,
			},
			lg: {
				container:
					"px-5 py-3 gap-2 text-mobile-base sm:text-tablet-base lg:text-desktop-lg",
				icon: 24,
			},
		};

		const currentColor = colorClasses[variant];
		const currentSize = sizeClasses[radioSize];

		// Build final classes
		const labelClasses = [
			baseClasses,
			currentSize.container,
			checked ? currentColor.checked : currentColor.unchecked,
			disabled ? "opacity-60 cursor-not-allowed" : "active:scale-[0.98]",
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<label className={labelClasses}>
				<input
					ref={ref}
					type="radio"
					value={value}
					checked={checked}
					disabled={disabled}
					className="sr-only"
					{...props}
				/>
				{mode === "icon" && Icon && <Icon size={currentSize.icon} />}
				{mode === "label" && label && <span>{label}</span>}
				{mode === "both" && (
					<>
						{Icon && <Icon size={currentSize.icon} />}
						{label && <span>{label}</span>}
					</>
				)}
			</label>
		);
	},
);

RadioButton.displayName = "RadioButton";

export default RadioButton;

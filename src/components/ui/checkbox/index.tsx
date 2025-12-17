"use client";

import { AlertCircle, Check } from "lucide-react";
import React, { forwardRef } from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
	label?: string;
	error?: string;
	helperText?: string;
	checkboxSize?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, error, helperText, checkboxSize = "md", fullWidth = false, className = "", disabled, checked, ...props }, ref) => {
		const sizeStyles = {
			sm: { box: "w-4 h-4", icon: 10, label: "text-xs", gap: "gap-2" },
			md: { box: "w-5 h-5", icon: 12, label: "text-sm", gap: "gap-3" },
			lg: { box: "w-6 h-6", icon: 14, label: "text-base", gap: "gap-3" },
		};

		const styles = sizeStyles[checkboxSize];

		return (
			<div className={fullWidth ? "w-full" : "w-auto"}>
				<label className={`flex items-start ${styles.gap} cursor-pointer group ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
					{/* Custom checkbox */}
					<div className="relative flex-shrink-0 mt-0.5">
						<input ref={ref} type="checkbox" checked={checked} disabled={disabled} className="sr-only peer" {...props} />
						<div
							className={`
								${styles.box} rounded-md border-2 transition-all duration-200
								flex items-center justify-center
								${checked ? "bg-accent border-accent" : "bg-white/5 border-white/20 group-hover:border-white/40"}
								${error ? "border-red-500" : ""}
								${disabled ? "" : "peer-focus:ring-2 peer-focus:ring-accent/30 peer-focus:ring-offset-1 peer-focus:ring-offset-transparent"}
							`}>
							{checked && <Check size={styles.icon} className="text-white" strokeWidth={3} />}
						</div>
					</div>

					{/* Label and helper */}
					{(label || helperText) && (
						<div className="flex-1 min-w-0">
							{label && (
								<span className={`block font-medium text-white ${styles.label} ${error ? "text-red-400" : ""}`}>
									{label}
									{props.required && <span className="text-red-400 ml-1">*</span>}
								</span>
							)}
							{helperText && !error && <span className="block text-xs text-muted mt-0.5">{helperText}</span>}
						</div>
					)}
				</label>

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

Checkbox.displayName = "Checkbox";

export default Checkbox;

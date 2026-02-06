"use client";

import React from "react";
import { LucideIcon, Check } from "lucide-react";

export interface RadioCardOption<T extends string = string> {
	value: T;
	label: string;
	description?: string;
	icon?: LucideIcon;
}

export interface RadioCardsProps<T extends string = string> {
	options: RadioCardOption<T>[];
	value?: T;
	onChange?: (value: T) => void;
	label?: string;
	error?: string;
	disabled?: boolean;
	columns?: 2 | 3 | 4;
	size?: "sm" | "md" | "lg";
	className?: string;
}

function RadioCards<T extends string = string>({
	options,
	value,
	onChange,
	label,
	error,
	disabled = false,
	columns = 3,
	size = "md",
	className = "",
}: RadioCardsProps<T>) {
	const gridCols = {
		2: "grid-cols-1 sm:grid-cols-2",
		3: "grid-cols-1 sm:grid-cols-3",
		4: "grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-4",
	};

	const sizeStyles = {
		sm: {
			card: "p-2.5 sm:p-3",
			iconContainer: "w-7 h-7 sm:w-8 sm:h-8 mb-2",
			iconSize: 14,
			label: "text-xs",
			description: "text-[10px]",
		},
		md: {
			card: "p-3 sm:p-4",
			iconContainer: "w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3",
			iconSize: 18,
			label: "text-xs sm:text-sm",
			description: "text-[10px] sm:text-xs",
		},
		lg: {
			card: "p-4 sm:p-5",
			iconContainer: "w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3",
			iconSize: 22,
			label: "text-sm sm:text-base",
			description: "text-xs sm:text-sm",
		},
	};

	const styles = sizeStyles[size];

	return (
		<div className={`space-y-3 ${className}`}>
			{label && (
				<label className="text-sm font-medium text-foreground">{label}</label>
			)}

			<div className={`grid ${gridCols[columns]} gap-3`}>
				{options.map((option) => {
					const isSelected = value === option.value;
					const Icon = option.icon;

					return (
						<button
							key={option.value}
							type="button"
							disabled={disabled}
							onClick={() => onChange?.(option.value)}
							className={`relative ${styles.card} rounded-xl border text-left transition-all duration-200 ${
								disabled
									? "opacity-50 cursor-not-allowed bg-surface border-border"
									: isSelected
										? "bg-accent/10 border-accent shadow-[0_0_15px_rgba(249,115,22,0.15)]"
										: "bg-surface border-border hover:bg-hover hover:border-border/80"
							}`}
						>
							{Icon && (
								<div
									className={`${styles.iconContainer} rounded-lg flex items-center justify-center ${
										isSelected ? "bg-accent/20" : "bg-surface"
									}`}
								>
									<Icon
										size={styles.iconSize}
										className={isSelected ? "text-accent" : "text-muted-foreground"}
									/>
								</div>
							)}

							<div className={`font-medium text-foreground ${styles.label} ${!option.description && !Icon ? "" : "mb-1"}`}>
								{option.label}
							</div>

							{option.description && (
								<div className={`text-muted-foreground leading-relaxed ${styles.description}`}>
									{option.description}
								</div>
							)}

							{isSelected && (
								<div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
									<Check size={12} className="text-white" strokeWidth={3} />
								</div>
							)}
						</button>
					);
				})}
			</div>

			{error && (
				<p className="text-xs text-red-400 mt-1">{error}</p>
			)}
		</div>
	);
}

export default RadioCards;

"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface MultiSelectPillsOption {
	value: string;
	label: string;
}

export interface MultiSelectPillsProps {
	label?: string;
	helperText?: string;
	options: MultiSelectPillsOption[];
	selectedItems: string[];
	onSelectedItemsChange: (items: string[]) => void;
	disabled?: boolean;
	optional?: boolean;
	error?: string;
}

const MultiSelectPills = ({ label, helperText, options, selectedItems, onSelectedItemsChange, disabled = false, optional = false, error }: MultiSelectPillsProps) => {
	const handleToggleItem = (itemValue: string) => {
		if (disabled) return;

		if (selectedItems.includes(itemValue)) {
			onSelectedItemsChange(selectedItems.filter((val) => val !== itemValue));
		} else {
			onSelectedItemsChange([...selectedItems, itemValue]);
		}
	};

	return (
		<div className="form-control w-full">
			{label && (
				<label className={cn("block text-sm font-medium text-white mb-2", disabled && "opacity-50")}>
					{label}
					{optional && <span className="text-muted ml-1.5 font-normal text-xs">(optional)</span>}
				</label>
			)}

			<div className="flex flex-wrap gap-2">
				{options.map((option) => {
					const isSelected = selectedItems.includes(option.value);
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => handleToggleItem(option.value)}
							disabled={disabled}
							className={cn(
								"px-2 py-1 rounded-full border transition-colors duration-200 text-sm font-medium",
								isSelected
									? "bg-active text-white/90"
									: "bg-hover border-border text-white/70 hover:bg-active hover:border-white/20",
								disabled && "opacity-50 cursor-not-allowed"
							)}>
							{option.label}
						</button>
					);
				})}
			</div>

			{error ? (
				<p className="mt-1.5 text-xs text-error">{error}</p>
			) : (
				helperText && <p className="mt-1.5 text-xs text-muted">{helperText}</p>
			)}
		</div>
	);
};

export default MultiSelectPills;

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
}

const MultiSelectPills = ({ label, helperText, options, selectedItems, onSelectedItemsChange, disabled = false, optional = false }: MultiSelectPillsProps) => {
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
									? "bg-neutral-600 text-white/90"
									: "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20",
								disabled && "opacity-50 cursor-not-allowed"
							)}>
							{option.label}
						</button>
					);
				})}
			</div>

			{helperText && <p className="mt-1.5 text-xs text-muted">{helperText}</p>}
		</div>
	);
};

export default MultiSelectPills;

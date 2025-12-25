"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, LucideIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface FilterOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface FilterDropdownProps {
	label: string;
	icon?: LucideIcon;
	options: FilterOption[];
	selected: string[];
	onChange: (selected: string[]) => void;
	onClear?: () => void;
	multiSelect?: boolean;
	className?: string;
}

const FilterDropdown = ({
	label,
	icon: Icon,
	options,
	selected,
	onChange,
	onClear,
	multiSelect = true,
	className,
}: FilterDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const count = selected.length;

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleOption = (value: string) => {
		if (multiSelect) {
			const isSelected = selected.includes(value);
			onChange(isSelected ? selected.filter((item) => item !== value) : [...selected, value]);
		} else {
			onChange([value]);
			setIsOpen(false);
		}
	};

	const handleClear = () => {
		onChange([]);
		onClear?.();
	};

	return (
		<div ref={containerRef} className={cn("dropdown", isOpen && "dropdown-open", className)}>
			{/* Trigger Button */}
			<button
				type="button"
				tabIndex={0}
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"btn btn-sm gap-2",
					count > 0 || isOpen
						? "btn-soft btn-accent"
						: "btn-ghost border border-base-content/10"
				)}
			>
				{Icon && <Icon size={14} />}
				<span>{label}</span>
				{count > 0 && (
					<span className="badge badge-xs badge-accent">{count}</span>
				)}
				<ChevronDown
					size={14}
					className={cn("transition-transform duration-200", isOpen && "rotate-180")}
				/>
			</button>

			{/* Dropdown Content */}
			{isOpen && (
				<>
					{/* Backdrop for mobile */}
					<div
						className="fixed inset-0 z-30 lg:hidden"
						onClick={() => setIsOpen(false)}
					/>

					<div
						tabIndex={0}
						className="dropdown-content menu bg-base-200 rounded-box z-40 w-56 p-1 shadow-xl border border-base-content/10 mt-2"
					>
						{options.map((option) => {
							const isSelected = selected.includes(option.value);
							return (
								<li key={option.value}>
									<button
										type="button"
										onClick={() => toggleOption(option.value)}
										disabled={option.disabled}
										className={cn(
											"flex items-center justify-between",
											isSelected && "active"
										)}
									>
										<span>{option.label}</span>
										{isSelected && <Check size={14} />}
									</button>
								</li>
							);
						})}

						{/* Clear Action */}
						{count > 0 && (
							<li className="border-t border-base-content/10 mt-1 pt-1">
								<button
									type="button"
									onClick={handleClear}
									className="text-base-content/60 text-xs justify-center"
								>
									Clear {label}
								</button>
							</li>
						)}
					</div>
				</>
			)}
		</div>
	);
};

FilterDropdown.displayName = "FilterDropdown";

export default FilterDropdown;

"use client";

import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../select";

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

const FilterDropdown = ({ label, icon: Icon, options, selected, onChange, onClear, multiSelect = true, className }: FilterDropdownProps) => {
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
		<Select>
			{/* Trigger Button */}
			<SelectTrigger>
				<SelectValue>
					{Icon && <Icon size={14} />}
					<span>{label}</span>
					{count > 0 && <span className="badge badge-xs badge-accent">{count}</span>}
				</SelectValue>
			</SelectTrigger>

			{/* Dropdown Content */}
			<SelectContent>
				<SelectGroup>
					<SelectLabel>{label}</SelectLabel>
					{options.map((option) => {
						return (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						);
					})}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};

FilterDropdown.displayName = "FilterDropdown";

export default FilterDropdown;

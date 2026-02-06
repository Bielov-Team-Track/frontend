"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDown, X } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Label } from "../label";

export interface MultiSelectOption<T = any> {
	value: string;
	label: string;
	data?: T;
	disabled?: boolean;
}

export interface MultiSelectProps<T = any> {
	label?: string;
	error?: string;
	helperText?: string;
	options: MultiSelectOption<T>[];
	placeholder?: string;
	value?: string[];
	onChange?: (value: string[]) => void;
	disabled?: boolean;
	required?: boolean;
	className?: string;
	id?: string;
	renderOption?: (option: MultiSelectOption<T>) => React.ReactNode;
	renderChip?: (option: MultiSelectOption<T>) => React.ReactNode;
	maxDisplayChips?: number;
}

function MultiSelect<T = any>({
	label,
	error,
	helperText,
	options,
	placeholder = "Select options...",
	className,
	disabled,
	value = [],
	onChange,
	required,
	id,
	renderOption,
	renderChip,
	maxDisplayChips = 3,
}: MultiSelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const hasError = Boolean(error);

	const selectedOptions = useMemo(
		() => options.filter((opt) => value.includes(opt.value)),
		[options, value]
	);

	const filteredOptions = useMemo(() => {
		if (!searchQuery) return options;
		const query = searchQuery.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(query));
	}, [options, searchQuery]);

	const handleToggleOption = useCallback(
		(optionValue: string) => {
			if (!onChange) return;
			const isSelected = value.includes(optionValue);
			if (isSelected) {
				onChange(value.filter((v) => v !== optionValue));
			} else {
				onChange([...value, optionValue]);
			}
		},
		[onChange, value]
	);

	const handleRemoveOption = useCallback(
		(optionValue: string, e: React.MouseEvent) => {
			e.stopPropagation();
			if (!onChange) return;
			onChange(value.filter((v) => v !== optionValue));
		},
		[onChange, value]
	);

	const handleClearAll = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (!onChange) return;
			onChange([]);
		},
		[onChange]
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
				inputRef.current?.blur();
			} else if (e.key === "Backspace" && !searchQuery && value.length > 0) {
				if (!onChange) return;
				onChange(value.slice(0, -1));
			}
		},
		[searchQuery, value, onChange]
	);

	// Close dropdown when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
				setSearchQuery("");
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const displayedChips = selectedOptions.slice(0, maxDisplayChips);
	const remainingCount = selectedOptions.length - maxDisplayChips;

	return (
		<div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
			{label && (
				<Label className={cn(hasError && "text-destructive")}>
					{label}
					{required && <span className="text-destructive ml-0.5">*</span>}
				</Label>
			)}

			<div
				className={cn(
					"relative min-h-9 w-full rounded-lg border bg-transparent px-2 py-1.5 text-sm transition-colors",
					"border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
					hasError && "border-destructive focus-within:ring-destructive/30",
					disabled && "opacity-50 cursor-not-allowed"
				)}
				onClick={() => {
					if (!disabled) {
						setIsOpen(true);
						inputRef.current?.focus();
					}
				}}>
				<div className="flex flex-wrap items-center gap-1">
					{/* Selected chips */}
					{displayedChips.map((option) => (
						<span
							key={option.value}
							className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/20 text-xs text-foreground">
							{renderChip ? renderChip(option) : option.label}
							<button
								type="button"
								onClick={(e) => handleRemoveOption(option.value, e)}
								className="hover:text-red-400 transition-colors"
								disabled={disabled}>
								<X size={12} />
							</button>
						</span>
					))}

					{remainingCount > 0 && (
						<span className="px-2 py-0.5 rounded-md bg-foreground/10 text-xs text-muted-foreground">
							+{remainingCount} more
						</span>
					)}

					{/* Search input */}
					<input
						ref={inputRef}
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onFocus={() => setIsOpen(true)}
						onKeyDown={handleKeyDown}
						placeholder={value.length === 0 ? placeholder : ""}
						disabled={disabled}
						className="flex-1 min-w-[60px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
					/>

					{/* Clear button and dropdown indicator */}
					<div className="flex items-center gap-1 ml-auto">
						{value.length > 0 && (
							<button
								type="button"
								onClick={handleClearAll}
								className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
								disabled={disabled}>
								<X size={14} />
							</button>
						)}
						<ChevronDown
							size={14}
							className={cn("text-muted-foreground transition-transform", isOpen && "rotate-180")}
						/>
					</div>
				</div>

				{/* Dropdown */}
				{isOpen && (
					<div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 overflow-auto rounded-lg border border-border bg-popover shadow-lg">
						{filteredOptions.length === 0 ? (
							<div className="px-3 py-2 text-sm text-muted-foreground text-center">
								{searchQuery ? "No matching options" : "No options available"}
							</div>
						) : (
							filteredOptions.map((option) => {
								const isSelected = value.includes(option.value);
								return (
									<div
										key={option.value}
										onClick={() => !option.disabled && handleToggleOption(option.value)}
										className={cn(
											"flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors",
											isSelected ? "bg-accent/10 text-foreground" : "hover:bg-hover",
											option.disabled && "opacity-50 cursor-not-allowed"
										)}>
										<div
											className={cn(
												"w-4 h-4 rounded border flex items-center justify-center transition-colors",
												isSelected
													? "bg-accent border-accent"
													: "border-muted-foreground/30"
											)}>
											{isSelected && <CheckIcon size={12} className="text-white" />}
										</div>
										{renderOption ? renderOption(option) : option.label}
									</div>
								);
							})
						)}
					</div>
				)}
			</div>

			{helperText && !error && (
				<p className="text-xs text-muted-foreground">{helperText}</p>
			)}

			{error && (
				<p className="text-xs text-destructive">{error}</p>
			)}
		</div>
	);
}

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
export default MultiSelect;

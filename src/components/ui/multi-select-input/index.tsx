"use client";

import { responsiveClasses } from "@/lib/utils/responsive";
import React, { forwardRef, useState } from "react";
import { FaExclamationCircle, FaTimes } from "react-icons/fa";

export interface MultiSelectInputProps<T> {
	label?: string;
	error?: string;
	helperText?: string;
	placeholder?: string;
	variant?: "default" | "bordered" | "ghost";
	inputSize?: "sm" | "md" | "lg";
	fullWidth?: boolean;
	disabled?: boolean;
	required?: boolean;
	optional?: boolean;

	// Selected items
	selectedItems: T[];
	onSelectedItemsChange: (items: T[]) => void;

	// Search functionality
	searchValue?: string;
	onSearchChange: (searchTerm: string) => void;

	// Display customization
	getItemKey: (item: T) => string | number;
	getItemLabel: (item: T) => string;

	// Optional
	maxSelectedItems?: number;
}

function MultiSelectInputInner<T>(
	{
		label,
		error,
		helperText,
		placeholder = "Search...",
		variant = "bordered",
		inputSize = "md",
		fullWidth = true,
		disabled = false,
		required = false,
		optional = false,
		selectedItems,
		onSelectedItemsChange,
		searchValue = "",
		onSearchChange,
		getItemKey,
		getItemLabel,
		maxSelectedItems,
	}: MultiSelectInputProps<T>,
	ref: React.ForwardedRef<HTMLInputElement>
) {
	const [isFocused, setIsFocused] = useState(false);

	// Build CSS classes
	const baseClasses =
		"input w-full transition-colors duration-200 focus:outline-none " +
		"focus:ring-1 focus:ring-offset-1 focus:ring-muted rounded-md outline-1 " +
		"bg-background-light text-muted placeholder:text-muted focus:placeholder:text ";

	const variantClasses = {
		default: "input-ghost",
		bordered: "input-bordered",
		ghost: "input-ghost",
	};

	const sizeClasses = {
		sm: "input-sm text-mobile-sm sm:text-mobile-base min-h-8",
		md: "input-md text-mobile-base sm:text-tablet-base lg:text-desktop-base min-h-10",
		lg: "input-lg text-mobile-base sm:text-tablet-base lg:text-desktop-lg min-h-12",
	};

	const stateClasses = {
		error: "input-error border-red-500 focus:border-red-500",
		focused: "ring-2 ring-primary ring-opacity-20",
		disabled: "input-disabled opacity-60 cursor-not-allowed",
	};

	const labelClasses = [
		"block font-medium mb-1 text-muted",
		responsiveClasses.text.label,
		error ? "text-red-600" : "",
		disabled ? "opacity-60" : "",
	]
		.filter(Boolean)
		.join(" ");

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		onSearchChange(value);
	};

	const handleRemoveItem = (item: T) => {
		onSelectedItemsChange(
			selectedItems.filter(
				(selected) => getItemKey(selected) !== getItemKey(item)
			)
		);
	};

	return (
		<div className={`form-control ${fullWidth ? "w-full" : "w-auto"}`}>
			{label && (
				<label className={labelClasses}>
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
					{optional && !required && (
						<span className="text-muted ml-1 font-normal text-sm">
							optional
						</span>
					)}
				</label>
			)}

			{/* Selected Items (Chips) */}
			{selectedItems.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{selectedItems.map((item) => (
						<div
							key={getItemKey(item)}
							className="inline-flex items-center gap-2 bg-primary text-white rounded-full px-3 py-1 text-sm font-semibold">
							<span>{getItemLabel(item)}</span>
							<button
								type="button"
								onClick={() => handleRemoveItem(item)}
								disabled={disabled}
								className="hover:bg-primary/80 rounded-full p-0.5 transition-colors disabled:opacity-50"
								aria-label={`Remove ${getItemLabel(item)}`}>
								<FaTimes size={12} />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Helper Text */}
			{helperText && !error && (
				<div className="mb-1">
					<span
						className={`${responsiveClasses.text.caption} text-muted text-sm`}>
						{helperText}
					</span>
				</div>
			)}

			{/* Input Field */}
			<input
				ref={ref}
				type="text"
				value={searchValue}
				onChange={handleSearchChange}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				placeholder={placeholder}
				disabled={
					disabled ||
					(maxSelectedItems !== undefined &&
						selectedItems.length >= maxSelectedItems)
				}
				className={[
					baseClasses,
					variantClasses[variant],
					sizeClasses[inputSize],
					error ? stateClasses.error : "",
					isFocused && !error ? stateClasses.focused : "",
					disabled ? stateClasses.disabled : "",
				]
					.filter(Boolean)
					.join(" ")}
			/>

			{/* Error Message */}
			{error && (
				<div className="flex items-center gap-1 mt-1 text-red-600">
					<FaExclamationCircle size={12} />
					<span className={responsiveClasses.text.caption}>
						{error}
					</span>
				</div>
			)}
		</div>
	);
}

// Export with forwardRef and generic support
export const MultiSelectInput = forwardRef(MultiSelectInputInner) as <T>(
	props: MultiSelectInputProps<T> & {
		ref?: React.ForwardedRef<HTMLInputElement>;
	}
) => ReturnType<typeof MultiSelectInputInner>;

export default MultiSelectInput;

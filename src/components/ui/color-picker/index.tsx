"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Check, Plus, X } from "lucide-react";
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";
import { Label } from "../label";

// Default preset colors for groups and other use cases
export const DEFAULT_PRESET_COLORS = [
	"#FF6B6B",
	"#4ECDC4",
	"#45B7D1",
	"#96CEB4",
	"#FFEAA7",
	"#DDA0DD",
	"#98D8C8",
	"#F7DC6F",
	"#BB8FCE",
	"#85C1E9",
	"#F1948A",
	"#82E0AA",
	"#F8C471",
	"#AED6F1",
	"#D7BDE2",
];

export interface ColorPickerProps {
	label?: string;
	error?: string;
	helperText?: string;
	optional?: boolean;
	required?: boolean;
	disabled?: boolean;
	className?: string;
	id?: string;

	// Color-specific props
	value?: string;
	onChange?: (color: string) => void;
	presetColors?: string[];
	allowCustom?: boolean;
}

function ColorPicker({
	label,
	error,
	helperText,
	optional,
	required,
	disabled,
	className,
	id: providedId,
	value,
	onChange,
	presetColors = DEFAULT_PRESET_COLORS,
	allowCustom = true,
}: ColorPickerProps) {
	const generatedId = useId();
	const id = providedId || generatedId;
	const hasError = Boolean(error);

	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [customColor, setCustomColor] = useState(value || "#6B7280");
	const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
	const [isVisible, setIsVisible] = useState(false);

	const popoverRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	// Check if current value is a custom color (not in presets)
	const isCustomColor = value && !presetColors.includes(value);

	// Calculate position based on available space
	useLayoutEffect(() => {
		if (!isPopoverOpen || !triggerRef.current || !popoverRef.current) {
			setIsVisible(false);
			return;
		}

		const triggerRect = triggerRef.current.getBoundingClientRect();
		const popoverRect = popoverRef.current.getBoundingClientRect();
		const gap = 8;

		// Default: position below the trigger, centered
		let top = triggerRect.bottom + gap;
		let left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;

		// Check bottom edge - if no space below, flip to top
		if (top + popoverRect.height > window.innerHeight - 10) {
			top = triggerRect.top - popoverRect.height - gap;
		}

		// If still off screen (top edge), push it down
		if (top < 10) {
			top = 10;
		}

		// Check right edge
		if (left + popoverRect.width > window.innerWidth - 10) {
			left = window.innerWidth - popoverRect.width - 10;
		}

		// Check left edge
		if (left < 10) {
			left = 10;
		}

		setPosition({ top, left });
		setIsVisible(true);
	}, [isPopoverOpen]);

	// Close popover when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(event.target as Node)
			) {
				setIsPopoverOpen(false);
			}
		};

		const handleResize = () => {
			setIsPopoverOpen(false);
		};

		if (isPopoverOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			window.addEventListener("resize", handleResize);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("resize", handleResize);
		};
	}, [isPopoverOpen]);

	// Update custom color when value changes externally
	useEffect(() => {
		if (value && !presetColors.includes(value)) {
			setCustomColor(value);
		}
	}, [value, presetColors]);

	const handleColorSelect = (color: string) => {
		if (disabled) return;
		onChange?.(color);
	};

	const handleCustomColorApply = () => {
		handleColorSelect(customColor);
		setIsPopoverOpen(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent, color: string) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleColorSelect(color);
		}
	};

	// Popover content rendered via portal
	const popoverContent =
		isPopoverOpen &&
		typeof document !== "undefined" &&
		createPortal(
			<div
				ref={popoverRef}
				role="dialog"
				aria-label="Custom color picker"
				style={{
					top: position.top,
					left: position.left,
					opacity: isVisible ? 1 : 0,
				}}
				className={cn("fixed z-50 rounded-xl overflow-hidden", "bg-neutral-900 border border-white/10 shadow-2xl", "transition-opacity duration-150")}>
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
					<span className="text-sm font-medium text-white">Custom Color</span>
					<button
						type="button"
						onClick={() => setIsPopoverOpen(false)}
						className="p-1 -mr-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
						aria-label="Close">
						<X size={16} />
					</button>
				</div>

				{/* Color Picker Content */}
				<div className="p-4 space-y-4">
					<HexColorPicker color={customColor} onChange={setCustomColor} style={{ width: "100%" }} />

					{/* Hex Input */}
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">#</span>
						<HexColorInput
							color={customColor}
							onChange={setCustomColor}
							prefixed={false}
							className={cn(
								"flex-1 px-3 py-2 rounded-lg text-sm font-mono uppercase",
								"bg-white/5 border border-white/10 text-white",
								"focus:outline-none focus:border-primary"
							)}
						/>
					</div>

					{/* Preview & Apply */}
					<div className="flex items-center gap-3">
						<div
							className="w-10 h-10 rounded-lg border border-white/20"
							style={{ backgroundColor: customColor }}
							aria-label={`Preview: ${customColor}`}
						/>
						<button
							type="button"
							onClick={handleCustomColorApply}
							className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-medium", "bg-primary hover:bg-primary/90 text-white", "transition-colors")}>
							Apply
						</button>
					</div>
				</div>
			</div>,
			document.body
		);

	return (
		<div className={cn("flex flex-col gap-1.5 w-full", className)} data-disabled={disabled}>
			{/* Label */}
			{label && (
				<Label htmlFor={id} className={cn(hasError && "text-destructive")}>
					{label}
					{required && <span className="text-destructive ml-1">*</span>}
					{optional && !required && <span className="text-muted-foreground ml-1.5 font-normal text-xs">(optional)</span>}
				</Label>
			)}

			{/* Color Swatches */}
			<div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label || "Color selection"}>
				{/* Preset Colors */}
				{presetColors.map((color) => (
					<button
						key={color}
						type="button"
						role="radio"
						aria-checked={value === color}
						aria-label={`Color ${color}`}
						disabled={disabled}
						onClick={() => handleColorSelect(color)}
						onKeyDown={(e) => handleKeyDown(e, color)}
						className={cn(
							"w-8 h-8 rounded-lg transition-all flex items-center justify-center",
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
							value === color ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "hover:scale-105",
							disabled && "opacity-50 cursor-not-allowed"
						)}
						style={{ backgroundColor: color }}>
						{value === color && <Check size={16} className="text-white drop-shadow-md" />}
					</button>
				))}

				{/* Custom Color Swatch (shown when a non-preset color is selected) */}
				{isCustomColor && (
					<button
						type="button"
						role="radio"
						aria-checked={true}
						aria-label={`Custom color ${value}`}
						disabled={disabled}
						onClick={() => setIsPopoverOpen(true)}
						className={cn(
							"w-8 h-8 rounded-lg transition-all flex items-center justify-center",
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
							"ring-2 ring-white ring-offset-2 ring-offset-background scale-110",
							disabled && "opacity-50 cursor-not-allowed"
						)}
						style={{ backgroundColor: value }}>
						<Check size={16} className="text-white drop-shadow-md" />
					</button>
				)}

				{/* Custom Color Trigger Button */}
				{allowCustom && (
					<button
						ref={triggerRef}
						type="button"
						aria-label="Choose custom color"
						aria-expanded={isPopoverOpen}
						aria-haspopup="dialog"
						disabled={disabled}
						onClick={() => setIsPopoverOpen(!isPopoverOpen)}
						className={cn(
							"w-8 h-8 rounded-lg transition-all flex items-center justify-center",
							"bg-white/10 border-2 border-dashed border-white/30 hover:border-white/50",
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
							"hover:scale-105",
							disabled && "opacity-50 cursor-not-allowed"
						)}>
						<Plus size={16} className="text-muted-foreground" />
					</button>
				)}
			</div>

			{/* Popover rendered via portal */}
			{popoverContent}

			{/* Helper Text */}
			{helperText && !error && (
				<p id={`${id}-helper`} className="text-xs text-muted-foreground">
					{helperText}
				</p>
			)}

			{/* Error Message */}
			{error && (
				<div id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-destructive">
					<AlertCircle size={14} className="shrink-0" />
					<span className="text-xs">{error}</span>
				</div>
			)}
		</div>
	);
}

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
export default ColorPicker;

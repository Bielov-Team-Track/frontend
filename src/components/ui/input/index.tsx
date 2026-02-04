"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Input as InputPrimitive } from "../input";
import { Label } from "../label";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	label?: string;
	inlineLabel?: string;
	error?: string;
	helperText?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	showPasswordToggle?: boolean;
	optional?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			inlineLabel,
			error,
			helperText,
			leftIcon,
			rightIcon,
			showPasswordToggle = false,
			type = "text",
			optional,
			disabled,
			required,
			className,
			id: providedId,
			onClick,
			...props
		},
		ref,
	) => {
		const generatedId = useId();
		const id = providedId || generatedId;
		const [showPassword, setShowPassword] = useState(false);
		const internalRef = useRef<HTMLInputElement>(null);

		// Combine refs for datetime picker functionality
		const setRefs = (element: HTMLInputElement | null) => {
			internalRef.current = element;
			if (typeof ref === "function") {
				ref(element);
			} else if (ref) {
				ref.current = element;
			}
		};

		// Check if this is a datetime-related input
		const isDateTimeInput = ["date", "datetime-local", "time", "month", "week"].includes(type);

		// Handle click to open native picker for datetime inputs
		const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
			if (isDateTimeInput && internalRef.current && !disabled) {
				internalRef.current.showPicker?.();
			}
			onClick?.(e);
		};

		// Ref to measure inline label width
		const inlineLabelRef = useRef<HTMLDivElement>(null);
		const [inlineLabelWidth, setInlineLabelWidth] = useState(0);

		// Measure inline label width on mount and when inlineLabel changes
		useEffect(() => {
			if (inlineLabelRef.current && inlineLabel) {
				const width = inlineLabelRef.current.offsetWidth;
				setInlineLabelWidth(width);
			} else {
				setInlineLabelWidth(0);
			}
		}, [inlineLabel]);

		// Also handle resize cases with ResizeObserver
		useEffect(() => {
			if (!inlineLabelRef.current || !inlineLabel) return;

			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setInlineLabelWidth(entry.target.clientWidth);
				}
			});

			resizeObserver.observe(inlineLabelRef.current);

			return () => {
				resizeObserver.disconnect();
			};
		}, [inlineLabel]);

		const isPasswordType = type === "password";
		const inputType = isPasswordType && showPassword ? "text" : type;
		const showToggle = isPasswordType && showPasswordToggle;
		const hasError = Boolean(error);

		// Calculate left padding
		const getLeftPadding = () => {
			if (inlineLabel && inlineLabelWidth > 0) {
				// Add a small gap (4px) after the inline label
				return inlineLabelWidth + 8;
			}
			if (leftIcon) {
				return 40; // pl-10 equivalent
			}
			return undefined;
		};

		const leftPadding = getLeftPadding();

		return (
			<div className="flex flex-col gap-1.5 w-full" data-disabled={disabled}>
				{/* Label */}
				{label && (
					<Label htmlFor={id} className={cn(hasError && "text-destructive", "gap-1")}>
						{label}
						{required && <span className="text-destructive">*</span>}
						{optional && !required && <span className="text-muted-foreground font-normal text-xs">(optional)</span>}
					</Label>
				)}

				{/* Input Container */}
				<div className="relative">
					{/* Left Icon */}
					{leftIcon && !inlineLabel && (
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">{leftIcon}</div>
					)}

					{/* Inline Label */}
					{inlineLabel && (
						<div
							ref={inlineLabelRef}
							className="text-muted-foreground bg-surface-elevated absolute top-1/2 -translate-y-1/2 left-0 flex items-center pointer-events-none px-2.5 py-2 rounded-l-lg text-xs gap-1">
							{leftIcon && <span className="text-muted-foreground mr-1 [&>svg]:size-4">{leftIcon}</span>}
							<span className="whitespace-nowrap">{inlineLabel}</span>
						</div>
					)}

					<InputPrimitive
						ref={setRefs}
						id={id}
						type={inputType}
						disabled={disabled}
						aria-invalid={hasError}
						aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
						onClick={handleClick}
						style={{
							paddingLeft: leftPadding ? `${leftPadding}px` : undefined,
						}}
						className={cn(
							"outline-none border-none ring-2 ring-white/10 focus:ring-primary transition-colors",
							// Error state
							hasError && "border-destructive focus-visible:ring-destructive/30",
							// Only apply class-based padding if no inline label (for leftIcon)
							!inlineLabel && leftIcon && "pl-10",
							(rightIcon || showToggle) && "pr-10",
							// Hide native datetime picker icons and make full field clickable
							className,
						)}
						{...props}
					/>

					{/* Right Icon or Password Toggle */}
					{(rightIcon || showToggle) && (
						<div className="absolute inset-y-0 right-0 pr-3 flex items-center">
							{showToggle ? (
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
									tabIndex={-1}
									disabled={disabled}
									aria-label={showPassword ? "Hide password" : "Show password"}>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							) : (
								<span className="text-muted-foreground">{rightIcon}</span>
							)}
						</div>
					)}
				</div>

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
	},
);

Input.displayName = "Input";

export { Input };
export default Input;

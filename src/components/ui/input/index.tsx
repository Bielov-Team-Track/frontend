"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useId, useState } from "react";
import { Input as InputPrimitive } from "../input";
import { Label } from "../label";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	label?: string;
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
			...props
		},
		ref
	) => {
		const generatedId = useId();
		const id = providedId || generatedId;
		const [showPassword, setShowPassword] = useState(false);

		const isPasswordType = type === "password";
		const inputType = isPasswordType && showPassword ? "text" : type;
		const showToggle = isPasswordType && showPasswordToggle;
		const hasError = Boolean(error);

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
					{leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">{leftIcon}</div>}

					<InputPrimitive
						ref={ref}
						id={id}
						type={inputType}
						disabled={disabled}
						aria-invalid={hasError}
						aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
						className={cn(
							"outline-none border-none ring-2 ring-white/10 focus:ring-primary transition-colors",
							// Error state
							hasError && "border-destructive focus-visible:ring-destructive/30",
							// Icon padding
							leftIcon && "pl-10",
							(rightIcon || showToggle) && "pr-10",
							className
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
	}
);

Input.displayName = "Input";

export { Input };
export default Input;

"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { useId } from "react";
import { Checkbox as CheckboxPrimitive } from "../checkbox";
import { Label } from "../label";

export interface CheckboxProps {
	label?: string;
	error?: string;
	helperText?: string;
	checked?: boolean;
	indeterminate?: boolean;
	onChange?: (checked: boolean) => void;
	disabled?: boolean;
	required?: boolean;
	className?: string;
	id?: string;
	name?: string;
	tabIndex?: number;
}

function Checkbox({
	label,
	error,
	helperText,
	checked,
	indeterminate,
	onChange,
	disabled,
	required,
	className,
	id: providedId,
	name,
	tabIndex,
}: CheckboxProps) {
	const generatedId = useId();
	const id = providedId || generatedId;
	const hasError = Boolean(error);

	return (
		<div className="flex flex-col gap-1.5" data-disabled={disabled}>
			<div className="flex items-start gap-2">
				<Label
					htmlFor={id}
					className={cn(
						"text-sm leading-none font-medium cursor-pointer",
						disabled && "cursor-not-allowed opacity-50",
						hasError && "text-destructive"
					)}>
					<CheckboxPrimitive
						id={id}
						indeterminate={indeterminate}
						checked={checked}
						onCheckedChange={onChange}
						disabled={disabled}
						name={name}
						tabIndex={tabIndex}
						aria-invalid={hasError}
						aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
						className={cn(hasError && "border-destructive aria-invalid:border-destructive", className)}
					/>
					{(label || helperText) && (
						<div className="grid gap-1 leading-none">
							{label && (
								<div>
									{label}
									{required && <span className="text-destructive ml-1">*</span>}
								</div>
							)}
							{helperText && !error && (
								<p id={`${id}-helper`} className="text-xs text-muted-foreground">
									{helperText}
								</p>
							)}
						</div>
					)}
				</Label>
			</div>

			{error && (
				<div id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-destructive">
					<AlertCircle size={14} className="shrink-0" />
					<span className="text-xs">{error}</span>
				</div>
			)}
		</div>
	);
}

Checkbox.displayName = "Checkbox";

export default Checkbox;
export { Checkbox };

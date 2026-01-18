import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import React, { forwardRef } from "react";
import { Button as ButtonPrimitive, buttonVariants } from "../button";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	fullWidth?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	loading?: boolean;
	asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant, size, fullWidth = false, leftIcon, rightIcon, loading = false, disabled, className, children, ...props }) => {
		return (
			<ButtonPrimitive
				variant={variant}
				size={size}
				className={cn(fullWidth && "w-full", loading && "cursor-wait", className)}
				disabled={disabled || loading}
				{...props}>
				{loading && <Loader2 className="size-4 animate-spin" />}
				{!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
				{children}
				{!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
			</ButtonPrimitive>
		);
	}
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;

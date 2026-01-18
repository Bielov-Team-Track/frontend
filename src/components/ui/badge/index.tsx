import { cn } from "@/lib/utils";
import React from "react";

type BadgeVariant = "solid" | "outline" | "dash" | "soft" | "ghost";
type BadgeColor = "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";
type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	color?: BadgeColor;
	size?: BadgeSize;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
	({ variant = "soft", color = "neutral", size = "sm", icon, iconPosition = "left", className, children, ...props }, ref) => {
		// Map variant to DaisyUI style class
		const variantClass = {
			solid: "",
			outline: "badge-outline",
			dash: "badge-dash",
			soft: "badge-soft",
			ghost: "badge-ghost",
		}[variant];

		// Map color to DaisyUI color class
		const colorClass = `badge-${color}`;

		// Map size to DaisyUI size class
		const sizeClass = `badge-${size}`;

		return (
			<span ref={ref} className={cn("badge", colorClass, variantClass, sizeClass, "gap-1", className)} {...props}>
				{icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
				{children}
				{icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
			</span>
		);
	}
);

Badge.displayName = "Badge";

export default Badge;

import { cn } from "@/lib/utils";
import React from "react";

type BadgeStyleVariant = "solid" | "outline" | "dash" | "soft" | "ghost";
type BadgeColor = "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error";

// Semantic shorthand variants: passing a color name as `variant` renders soft style in that color.
// Style variants control appearance; color variants are shorthand aliases for common status badges.
export type BadgeVariant = BadgeStyleVariant | BadgeColor | "custom";

type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
	color?: BadgeColor;
	size?: BadgeSize;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
}

const COLOR_VARIANTS = new Set<BadgeColor>([
	"primary",
	"secondary",
	"accent",
	"neutral",
	"info",
	"success",
	"warning",
	"error",
]);

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
	({ variant = "soft", color, size = "sm", icon, iconPosition = "left", className, children, ...props }, ref) => {
		// When `variant` is a semantic color alias (e.g. "success", "error"), treat it as
		// a shorthand for color=<value> + style=soft. This allows consumers to write
		// <Badge variant="success"> instead of <Badge color="success">.
		let resolvedColor: BadgeColor | undefined = color;
		let resolvedStyle: BadgeStyleVariant = "soft";

		if (variant === "custom") {
			// "custom" variant: no DaisyUI color/style classes applied; rely entirely on className/style props
			resolvedColor = undefined;
			resolvedStyle = "soft"; // won't be used since we skip colorClass below
		} else if (COLOR_VARIANTS.has(variant as BadgeColor)) {
			// Semantic shorthand: treat as color + soft style
			resolvedColor = variant as BadgeColor;
			resolvedStyle = "soft";
		} else {
			// Standard style variant
			resolvedStyle = variant as BadgeStyleVariant;
			resolvedColor = color ?? "neutral";
		}

		// Map style to DaisyUI style class
		const styleClassMap: Record<BadgeStyleVariant, string> = {
			solid: "",
			outline: "badge-outline",
			dash: "badge-dash",
			soft: "badge-soft",
			ghost: "badge-ghost",
		};
		const variantClass = styleClassMap[resolvedStyle];

		// Map color to DaisyUI color class (skipped for "custom" variant)
		const colorClass = variant === "custom" ? "" : resolvedColor ? `badge-${resolvedColor}` : "";

		// Map size to DaisyUI size class
		const sizeClass = `badge-${size}`;

		return (
			<span ref={ref} className={cn("badge inline-flex items-center", colorClass, variantClass, sizeClass, "gap-1", className)} {...props}>
				{icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
				{children}
				{icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
			</span>
		);
	}
);

Badge.displayName = "Badge";

export default Badge;

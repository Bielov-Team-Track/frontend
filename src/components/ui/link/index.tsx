"use client";

import { cn } from "@/lib/utils";
import { default as LinkNext } from "next/link";
import React, { forwardRef } from "react";

type LinkColor = "neutral" | "primary" | "secondary" | "accent" | "success" | "info" | "warning" | "error";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	color?: LinkColor;
	hover?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	children: React.ReactNode;
	href?: string;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
	(
		{
			color = "primary",
			hover = false,
			leftIcon,
			rightIcon,
			children,
			className = "",
			href,
			...props
		},
		ref,
	) => {
		// DaisyUI color classes
		const colorClass = `link-${color}`;

		return (
			<LinkNext
				ref={ref}
				href={href || "#"}
				className={cn(
					"link",
					colorClass,
					hover && "link-hover",
					leftIcon || rightIcon ? "inline-flex items-center gap-1" : "",
					className
				)}
				{...props}
			>
				{leftIcon && <span className="shrink-0">{leftIcon}</span>}
				{children}
				{rightIcon && <span className="shrink-0">{rightIcon}</span>}
			</LinkNext>
		);
	},
);

Link.displayName = "Link";

export default Link;

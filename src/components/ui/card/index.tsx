"use client";

import { cn } from "@/lib/utils";
import React from "react";

type CardVariant = "default" | "border" | "dash";
type CardSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: CardVariant;
	size?: CardSize;
	imageFull?: boolean;
	side?: boolean;
	hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ variant = "default", size = "md", imageFull = false, side = false, hoverable = false, className, children, ...props }, ref) => {
		const variantClass = {
			default: "",
			border: "card-border",
			dash: "card-dash",
		}[variant];

		const sizeClass = `card-${size}`;

		return (
			<div
				ref={ref}
				className={cn(
					"card bg-base-100",
					variantClass,
					sizeClass,
					imageFull && "image-full",
					side && "card-side",
					hoverable && "hover:shadow-lg transition-shadow duration-300",
					className
				)}
				{...props}>
				{children}
			</div>
		);
	}
);

Card.displayName = "Card";

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(({ className, children, ...props }, ref) => (
	<div ref={ref} className={cn("card-body", className)} {...props}>
		{children}
	</div>
));

CardBody.displayName = "CardBody";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ as: Component = "h2", className, children, ...props }, ref) => (
	<Component ref={ref} className={cn("card-title", className)} {...props}>
		{children}
	</Component>
));

CardTitle.displayName = "CardTitle";

export interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
	justify?: "start" | "end" | "center" | "between";
}

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(({ justify = "end", className, children, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"card-actions",
			{
				"justify-start": justify === "start",
				"justify-end": justify === "end",
				"justify-center": justify === "center",
				"justify-between": justify === "between",
			},
			className
		)}
		{...props}>
		{children}
	</div>
));

CardActions.displayName = "CardActions";

export interface CardFigureProps extends React.HTMLAttributes<HTMLElement> {}

const CardFigure = React.forwardRef<HTMLElement, CardFigureProps>(({ className, children, ...props }, ref) => (
	<figure ref={ref} className={cn(className)} {...props}>
		{children}
	</figure>
));

CardFigure.displayName = "CardFigure";

export { Card, CardActions, CardBody, CardFigure, CardTitle };
export default Card;

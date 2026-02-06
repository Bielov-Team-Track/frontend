"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
	icon?: ReactNode;
	label: string;
	value: string | number;
	subValue?: string;
	trend?: "up" | "down" | "neutral";
	trendValue?: string;
	className?: string;
}

const StatCard = ({
	icon,
	label,
	value,
	subValue,
	trend,
	trendValue,
	className,
}: StatCardProps) => {
	return (
		<div
			className={cn(
				"bg-surface rounded-lg p-4 flex flex-col gap-2",
				"hover:bg-surface/80 transition-colors",
				className
			)}>
			<div className="flex items-center gap-2">
				{icon && <span className="text-primary text-lg">{icon}</span>}
				<span className="text-sm text-muted-foreground">{label}</span>
			</div>
			<div className="flex items-end gap-2">
				<span className="text-2xl font-bold text-foreground">{value}</span>
				{subValue && (
					<span className="text-sm text-muted-foreground mb-0.5">{subValue}</span>
				)}
			</div>
			{trend && trendValue && (
				<div
					className={cn(
						"text-xs flex items-center gap-1",
						trend === "up" && "text-success",
						trend === "down" && "text-error",
						trend === "neutral" && "text-muted-foreground"
					)}>
					{trend === "up" && "↑"}
					{trend === "down" && "↓"}
					{trend === "neutral" && "→"}
					<span>{trendValue}</span>
				</div>
			)}
		</div>
	);
};

export default StatCard;

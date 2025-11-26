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
				"bg-base-300 rounded-lg p-4 flex flex-col gap-2",
				"hover:bg-base-300/80 transition-colors",
				className
			)}>
			<div className="flex items-center gap-2">
				{icon && <span className="text-primary text-lg">{icon}</span>}
				<span className="text-sm text-gray-400">{label}</span>
			</div>
			<div className="flex items-end gap-2">
				<span className="text-2xl font-bold text-white">{value}</span>
				{subValue && (
					<span className="text-sm text-gray-400 mb-0.5">{subValue}</span>
				)}
			</div>
			{trend && trendValue && (
				<div
					className={cn(
						"text-xs flex items-center gap-1",
						trend === "up" && "text-success",
						trend === "down" && "text-error",
						trend === "neutral" && "text-gray-400"
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

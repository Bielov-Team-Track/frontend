"use client";

import { cn } from "@/lib/utils";

interface SkillRatingBarProps {
	label: string;
	value: number; // 0-100
	maxValue?: number;
	showValue?: boolean;
	size?: "sm" | "md" | "lg";
	color?: "primary" | "accent" | "success" | "warning" | "info";
}

const colorClasses = {
	primary: "bg-primary",
	accent: "bg-accent",
	success: "bg-success",
	warning: "bg-warning",
	info: "bg-info",
};

const sizeClasses = {
	sm: "h-1.5",
	md: "h-2.5",
	lg: "h-4",
};

const SkillRatingBar = ({
	label,
	value,
	maxValue = 100,
	showValue = true,
	size = "md",
	color = "primary",
}: SkillRatingBarProps) => {
	const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

	return (
		<div className="flex flex-col gap-1">
			<div className="flex justify-between items-center">
				<span className="text-sm text-muted-foreground capitalize">{label}</span>
				{showValue && (
					<span className="text-sm font-semibold text-foreground">{value}</span>
				)}
			</div>
			<div
				className={cn(
					"w-full bg-surface rounded-full overflow-hidden",
					sizeClasses[size]
				)}>
				<div
					className={cn(
						"h-full rounded-full transition-all duration-500 ease-out",
						colorClasses[color]
					)}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
};

export default SkillRatingBar;

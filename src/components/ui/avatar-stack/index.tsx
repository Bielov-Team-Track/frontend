"use client";

import { cn } from "@/lib/utils";
import { UserPlus } from "lucide-react";
import Avatar from "../avatar/index";

export interface AvatarStackItem {
	id: string;
	name: string;
	imageUrl?: string | null;
}

export interface AvatarStackProps {
	items: AvatarStackItem[];
	max?: number;
	size?: "xs" | "sm" | "md";
	emptyText?: string;
	showCount?: boolean;
	className?: string;
}

const sizeClasses = {
	xs: {
		avatar: "size-6",
		count: "size-6 text-[10px]",
		spacing: "-space-x-1.5",
	},
	sm: {
		avatar: "size-8",
		count: "size-8 text-xs",
		spacing: "-space-x-2",
	},
	md: {
		avatar: "size-10",
		count: "size-10 text-sm",
		spacing: "-space-x-2.5",
	},
};

export default function AvatarStack({
	items,
	max = 4,
	size = "sm",
	emptyText = "No one selected",
	showCount = true,
	className,
}: AvatarStackProps) {
	const visible = items.slice(0, max);
	const remaining = items.length - max;
	const classes = sizeClasses[size];

	if (items.length === 0) {
		return (
			<div className={cn("flex items-center gap-2 text-muted-foreground text-sm", className)}>
				<div
					className={cn(
						"rounded-full bg-surface border-2 border-border flex items-center justify-center",
						classes.avatar
					)}>
					<UserPlus size={size === "xs" ? 12 : size === "sm" ? 14 : 16} className="text-muted-foreground" />
				</div>
				<span>{emptyText}</span>
			</div>
		);
	}

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div className={cn("flex", classes.spacing)}>
				{visible.map((item) => (
					<Avatar
						key={item.id}
						name={item.name}
						src={item.imageUrl}
						variant="user"
						size={size}
						className="ring-2 ring-neutral-900"
					/>
				))}
				{remaining > 0 && (
					<div
						className={cn(
							"rounded-full bg-surface flex items-center justify-center font-medium text-white ring-2 ring-neutral-900",
							classes.count
						)}>
						+{remaining}
					</div>
				)}
			</div>
			{showCount && (
				<span className="text-sm text-muted-foreground">
					{items.length} selected
				</span>
			)}
		</div>
	);
}

export { AvatarStack };

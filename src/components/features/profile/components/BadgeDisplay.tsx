"use client";

import { Badge } from "@/lib/models/User";
import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
	badge: Badge;
	size?: "sm" | "md" | "lg";
	showTooltip?: boolean;
}

const rarityColors = {
	common: "from-gray-500 to-gray-600 border-gray-500",
	rare: "from-blue-500 to-blue-600 border-blue-500",
	epic: "from-purple-500 to-purple-600 border-purple-500",
	legendary: "from-amber-500 to-orange-500 border-amber-500",
};

const rarityGlow = {
	common: "",
	rare: "shadow-blue-500/30",
	epic: "shadow-purple-500/30",
	legendary: "shadow-amber-500/50 animate-pulse",
};

const sizeClasses = {
	sm: "w-10 h-10 text-lg",
	md: "w-14 h-14 text-2xl",
	lg: "w-20 h-20 text-4xl",
};

const BadgeDisplay = ({
	badge,
	size = "md",
	showTooltip = true,
}: BadgeDisplayProps) => {
	return (
		<div className="group relative">
			<div
				className={cn(
					"rounded-full bg-linear-to-br border-2 flex items-center justify-center",
					"transition-transform hover:scale-110",
					sizeClasses[size],
					rarityColors[badge.rarity],
					rarityGlow[badge.rarity],
					badge.rarity === "legendary" && "shadow-lg"
				)}>
				<span role="img" aria-label={badge.name}>
					{badge.icon}
				</span>
			</div>
			{showTooltip && (
				<div
					className={cn(
						"absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2",
						"bg-card rounded-lg shadow-xl border border-border",
						"opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
						"whitespace-nowrap z-10 min-w-max"
					)}>
					<div className="text-sm font-semibold text-white">{badge.name}</div>
					<div className="text-xs text-muted-foreground">{badge.description}</div>
					<div
						className={cn(
							"text-xs mt-1 capitalize",
							badge.rarity === "common" && "text-gray-500",
							badge.rarity === "rare" && "text-blue-400",
							badge.rarity === "epic" && "text-purple-400",
							badge.rarity === "legendary" && "text-warning"
						)}>
						{badge.rarity}
					</div>
				</div>
			)}
		</div>
	);
};

interface BadgeGridProps {
	badges: Badge[];
	maxDisplay?: number;
	size?: "sm" | "md" | "lg";
}

export const BadgeGrid = ({
	badges,
	maxDisplay = 6,
	size = "md",
}: BadgeGridProps) => {
	const displayBadges = badges.slice(0, maxDisplay);
	const remainingCount = badges.length - maxDisplay;

	return (
		<div className="flex flex-wrap gap-3 items-center">
			{displayBadges.map((badge) => (
				<BadgeDisplay key={badge.id} badge={badge} size={size} />
			))}
			{remainingCount > 0 && (
				<div
					className={cn(
						"rounded-full bg-surface flex items-center justify-center text-muted-foreground text-sm font-medium",
						sizeClasses[size]
					)}>
					+{remainingCount}
				</div>
			)}
		</div>
	);
};

export default BadgeDisplay;

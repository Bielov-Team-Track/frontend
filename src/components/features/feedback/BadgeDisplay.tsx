"use client";

import { Badge as BadgeComponent } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
	Award,
	Flame,
	Heart,
	Shield,
	Star,
	Target,
	Trophy,
	Zap,
	type LucideIcon,
} from "lucide-react";

/**
 * Badge types matching backend BadgeTypeEnum
 */
export type BadgeType =
	| "FirstEvent"
	| "EventOrganizer"
	| "TeamPlayer"
	| "MVP"
	| "Consistent"
	| "Champion"
	| "SocialButterfly"
	| "EarlyBird";

interface BadgeInfo {
	icon: LucideIcon;
	name: string;
	description: string;
	color: string;
	bgColor: string;
	borderColor: string;
	glowColor?: string;
}

/**
 * Badge configuration with icons, names, descriptions, and colors
 */
export const BADGE_INFO: Record<BadgeType, BadgeInfo> = {
	FirstEvent: {
		icon: Star,
		name: "First Event",
		description: "Attended your first volleyball event",
		color: "text-blue-400",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500/30",
		glowColor: "shadow-blue-500/20",
	},
	EventOrganizer: {
		icon: Target,
		name: "Event Organizer",
		description: "Organized a community event",
		color: "text-purple-400",
		bgColor: "bg-purple-500/10",
		borderColor: "border-purple-500/30",
		glowColor: "shadow-purple-500/20",
	},
	TeamPlayer: {
		icon: Heart,
		name: "Team Player",
		description: "Participated in 10+ team events",
		color: "text-pink-400",
		bgColor: "bg-pink-500/10",
		borderColor: "border-pink-500/30",
		glowColor: "shadow-pink-500/20",
	},
	MVP: {
		icon: Trophy,
		name: "MVP",
		description: "Most Valuable Player of the event",
		color: "text-amber-400",
		bgColor: "bg-amber-500/10",
		borderColor: "border-amber-500/30",
		glowColor: "shadow-amber-500/30",
	},
	Consistent: {
		icon: Flame,
		name: "Consistent Performer",
		description: "Attended events 5 weeks in a row",
		color: "text-orange-400",
		bgColor: "bg-orange-500/10",
		borderColor: "border-orange-500/30",
		glowColor: "shadow-orange-500/20",
	},
	Champion: {
		icon: Award,
		name: "Champion",
		description: "Won a tournament",
		color: "text-yellow-400",
		bgColor: "bg-yellow-500/10",
		borderColor: "border-yellow-500/30",
		glowColor: "shadow-yellow-500/40",
	},
	SocialButterfly: {
		icon: Zap,
		name: "Social Butterfly",
		description: "Played with 20+ different players",
		color: "text-cyan-400",
		bgColor: "bg-cyan-500/10",
		borderColor: "border-cyan-500/30",
		glowColor: "shadow-cyan-500/20",
	},
	EarlyBird: {
		icon: Shield,
		name: "Early Bird",
		description: "Consistently arrives early to events",
		color: "text-green-400",
		bgColor: "bg-green-500/10",
		borderColor: "border-green-500/30",
		glowColor: "shadow-green-500/20",
	},
};

interface BadgeDisplayProps {
	badgeType: BadgeType;
	size?: "sm" | "md" | "lg";
	showTooltip?: boolean;
	className?: string;
}

/**
 * Displays a single badge with icon, name, and optional tooltip
 *
 * @example
 * ```tsx
 * <BadgeDisplay
 *   badgeType="MVP"
 *   size="md"
 *   showTooltip={true}
 * />
 * ```
 */
export function BadgeDisplay({
	badgeType,
	size = "md",
	showTooltip = true,
	className,
}: BadgeDisplayProps) {
	const badge = BADGE_INFO[badgeType];
	const Icon = badge.icon;

	const sizeClasses = {
		sm: "w-10 h-10 text-lg",
		md: "w-14 h-14 text-2xl",
		lg: "w-20 h-20 text-4xl",
	};

	return (
		<div className={cn("group relative", className)}>
			{/* Badge Circle */}
			<div
				className={cn(
					"rounded-full border-2 flex items-center justify-center",
					"transition-all duration-200 hover:scale-110",
					sizeClasses[size],
					badge.bgColor,
					badge.borderColor,
					badge.color,
					badge.glowColor && "shadow-lg"
				)}
			>
				<Icon className="w-1/2 h-1/2" />
			</div>

			{/* Tooltip */}
			{showTooltip && (
				<div
					className={cn(
						"absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2",
						"bg-card rounded-lg shadow-xl border border-border",
						"opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
						"whitespace-nowrap z-50 min-w-max"
					)}
				>
					<div className="text-sm font-semibold text-foreground">{badge.name}</div>
					<div className="text-xs text-muted-foreground mt-0.5">
						{badge.description}
					</div>
				</div>
			)}
		</div>
	);
}

interface BadgeGridProps {
	badges: BadgeType[];
	maxDisplay?: number;
	size?: "sm" | "md" | "lg";
	className?: string;
}

/**
 * Displays a grid of badges with overflow indicator
 *
 * @example
 * ```tsx
 * <BadgeGrid
 *   badges={["FirstEvent", "MVP", "Champion", "TeamPlayer"]}
 *   maxDisplay={3}
 *   size="md"
 * />
 * // Shows first 3 badges + "+1 more"
 * ```
 */
export function BadgeGrid({
	badges,
	maxDisplay = 6,
	size = "md",
	className,
}: BadgeGridProps) {
	const displayBadges = badges.slice(0, maxDisplay);
	const remainingCount = badges.length - maxDisplay;

	const sizeClasses = {
		sm: "w-10 h-10 text-xs",
		md: "w-14 h-14 text-sm",
		lg: "w-20 h-20 text-base",
	};

	return (
		<div className={cn("flex flex-wrap gap-3 items-center", className)}>
			{displayBadges.map((badgeType, index) => (
				<BadgeDisplay key={`${badgeType}-${index}`} badgeType={badgeType} size={size} />
			))}
			{remainingCount > 0 && (
				<div
					className={cn(
						"rounded-full bg-surface border-2 border-border",
						"flex items-center justify-center",
						"text-muted-foreground font-medium",
						sizeClasses[size]
					)}
				>
					+{remainingCount}
				</div>
			)}
		</div>
	);
}

export default BadgeDisplay;

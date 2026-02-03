"use client";

import {
	Bookmark,
	ChevronRight,
	Clock,
	Heart,
	Users,
	Flame,
	Zap,
	Leaf,
	Target,
	Swords,
	Gamepad2,
	Dumbbell,
	Wind,
	Sun,
	Building2,
	User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Drill, DrillCategory, DrillIntensity, DrillSkill } from "./types";

interface DrillListItemProps {
	drill: Drill;
	onSkillClick?: (skill: DrillSkill) => void;
	onLikeClick?: (drillId: string) => void;
	onBookmarkClick?: (drillId: string) => void;
	highlightedSkills?: DrillSkill[];
}

// Intensity config with Tailwind color classes
const INTENSITY_CONFIG: Record<DrillIntensity, { label: string; icon: typeof Leaf; classes: string }> = {
	Low: { label: "Light", icon: Leaf, classes: "text-emerald-400 bg-emerald-500/15" },
	Medium: { label: "Moderate", icon: Flame, classes: "text-amber-400 bg-amber-500/15" },
	High: { label: "Intense", icon: Zap, classes: "text-rose-400 bg-rose-500/15" },
};

// Category config with Tailwind color classes
const CATEGORY_CONFIG: Record<DrillCategory, { label: string; icon: typeof Sun; classes: string }> = {
	Warmup: { label: "Warm-up", icon: Sun, classes: "text-orange-400 bg-orange-500/15" },
	Technical: { label: "Technical", icon: Target, classes: "text-sky-400 bg-sky-500/15" },
	Tactical: { label: "Tactical", icon: Swords, classes: "text-violet-400 bg-violet-500/15" },
	Game: { label: "Game", icon: Gamepad2, classes: "text-pink-400 bg-pink-500/15" },
	Conditioning: { label: "Fitness", icon: Dumbbell, classes: "text-yellow-400 bg-yellow-500/15" },
	Cooldown: { label: "Cool-down", icon: Wind, classes: "text-teal-400 bg-teal-500/15" },
};

export default function DrillListItem({ drill, onSkillClick, onLikeClick, onBookmarkClick, highlightedSkills = [] }: DrillListItemProps) {
	const intensity = INTENSITY_CONFIG[drill.intensity];
	const category = CATEGORY_CONFIG[drill.category];
	const IntensityIcon = intensity.icon;
	const CategoryIcon = category.icon;

	// Get author display name
	const authorName = drill.author?.firstName && drill.author?.lastName
		? `${drill.author.firstName} ${drill.author.lastName}`
		: drill.author?.firstName || drill.author?.lastName || null;

	const handleSkillClick = (e: React.MouseEvent, skill: DrillSkill) => {
		if (onSkillClick) {
			e.preventDefault();
			e.stopPropagation();
			onSkillClick(skill);
		}
	};

	const handleLikeClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onLikeClick?.(drill.id);
	};

	const handleBookmarkClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onBookmarkClick?.(drill.id);
	};

	return (
		<Link href={`/dashboard/training/drills/${drill.id}`} className="group block">
			<div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all">
				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Title */}
					<h3 className="text-base font-semibold text-white truncate group-hover:text-accent transition-colors">
						{drill.name}
					</h3>

					{/* Metadata row: Duration, Players, Intensity, Type */}
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs">
						{/* Duration */}
						{drill.duration && (
							<div className="flex items-center gap-1.5 text-muted">
								<Clock size={12} />
								<span className="tabular-nums">{drill.duration} min</span>
							</div>
						)}

						{/* Players */}
						{drill.minPlayers && (
							<div className="flex items-center gap-1.5 text-muted">
								<Users size={12} />
								<span className="tabular-nums">
									{drill.minPlayers}
									{drill.maxPlayers && drill.maxPlayers !== drill.minPlayers
										? `–${drill.maxPlayers}`
										: "+"}
								</span>
							</div>
						)}

						{/* Divider */}
						{(drill.duration || drill.minPlayers) && (
							<div className="w-px h-4 bg-white/10" />
						)}

						{/* Intensity */}
						<div className="flex items-center gap-1.5">
							<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${intensity.classes}`}>
								<IntensityIcon size={12} />
								{intensity.label}
							</span>
						</div>

						{/* Type */}
						<div className="flex items-center gap-1.5">
							<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${category.classes}`}>
								<CategoryIcon size={12} />
								{category.label}
							</span>
						</div>
					</div>

					{/* Skills */}
					{drill.skills.length > 0 && (
						<div className="flex items-center gap-2 mt-2.5">
							<span className="text-xs text-muted shrink-0">Skills:</span>
							<div className="flex flex-wrap items-center gap-1.5">
								{drill.skills.map((skill) => {
									const isHighlighted = highlightedSkills.includes(skill);
									return (
										<button
											key={skill}
											onClick={(e) => handleSkillClick(e, skill)}
											className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
												isHighlighted
													? "bg-accent/20 text-accent ring-1 ring-accent/50"
													: "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
											}`}
										>
											{skill}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* Footer: Likes/Saves on left, Author/Club on right */}
					<div className="flex items-end justify-between gap-3 mt-2">
						{/* Left: Likes + Saves */}
						<div className="flex items-center gap-3">
							<button
								onClick={handleLikeClick}
								className={`flex items-center gap-1 transition-colors ${
									drill.isLiked ? "text-rose-400" : "text-muted hover:text-rose-400"
								}`}
								title="Like"
							>
								<Heart
									size={14}
									className={drill.isLiked ? "fill-rose-400" : ""}
								/>
								<span className="text-xs tabular-nums">{drill.likeCount || 0}</span>
							</button>
							<button
								onClick={handleBookmarkClick}
								className={`flex items-center gap-1 transition-colors ${
									drill.isBookmarked ? "text-amber-400" : "text-muted hover:text-amber-400"
								}`}
								title="Save"
							>
								<Bookmark
									size={14}
									className={drill.isBookmarked ? "fill-amber-400" : ""}
								/>
								<span className="text-xs tabular-nums">{drill.bookmarkCount || 0}</span>
							</button>
						</div>

						{/* Right: Club (priority) or Author */}
						{drill.clubName ? (
							<Link
								href={`/dashboard/clubs/${drill.clubId}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 text-[11px] text-muted/70 hover:text-white transition-colors group/club">
								<span className="truncate max-w-[100px] group-hover/club:underline">{drill.clubName}</span>
								<Avatar size="sm" className="size-4">
									{drill.clubLogoUrl ? (
										<AvatarImage src={drill.clubLogoUrl} alt={drill.clubName} />
									) : null}
									<AvatarFallback className="text-[8px]">
										<Building2 size={8} />
									</AvatarFallback>
								</Avatar>
							</Link>
						) : authorName ? (
							<Link
								href={`/dashboard/profile/${drill.author?.id}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 text-[11px] text-muted/70 hover:text-white transition-colors group/author">
								<span className="truncate max-w-[100px] group-hover/author:underline">{authorName}</span>
								<Avatar size="sm" className="size-4">
									{drill.author?.avatarUrl ? (
										<AvatarImage src={drill.author.avatarUrl} alt={authorName} />
									) : null}
									<AvatarFallback className="text-[8px]">
										{drill.author?.firstName?.[0] || drill.author?.lastName?.[0] || <User size={8} />}
									</AvatarFallback>
								</Avatar>
							</Link>
						) : null}
					</div>
				</div>

				{/* Arrow */}
				<div className="hidden sm:flex items-center">
					<ChevronRight size={18} className="text-muted group-hover:text-white transition-colors" />
				</div>
			</div>
		</Link>
	);
}

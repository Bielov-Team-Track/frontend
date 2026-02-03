"use client";

import {
	Clock,
	Heart,
	Bookmark,
	Plus,
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

interface DrillCardProps {
	drill: Drill;
	onAdd?: (drill: Drill) => void;
	showAddButton?: boolean;
	variant?: "compact" | "full";
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

export default function DrillCard({
	drill,
	onAdd,
	showAddButton = true,
	variant = "full",
	onSkillClick,
	onLikeClick,
	onBookmarkClick,
	highlightedSkills = [],
}: DrillCardProps) {
	const handleAdd = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onAdd?.(drill);
	};

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

	const intensity = INTENSITY_CONFIG[drill.intensity];
	const category = CATEGORY_CONFIG[drill.category];
	const IntensityIcon = intensity.icon;
	const CategoryIcon = category.icon;

	// Get author display name
	const authorName = drill.author?.firstName && drill.author?.lastName
		? `${drill.author.firstName} ${drill.author.lastName}`
		: drill.author?.firstName || drill.author?.lastName || null;

	if (variant === "compact") {
		return (
			<Link
				href={`/dashboard/training/drills/${drill.id}`}
				className="group block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${intensity.classes}`}>
								<IntensityIcon size={10} />
								{intensity.label}
							</span>
							<span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${category.classes}`}>
								<CategoryIcon size={10} />
								{category.label}
							</span>
						</div>
						<h4 className="font-semibold text-white text-sm group-hover:text-accent transition-colors">{drill.name}</h4>
						<div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
							{drill.duration && <span>{drill.duration}m</span>}
							<span className="truncate">{drill.skills.slice(0, 2).join(" · ")}</span>
						</div>
						{/* Club (priority) or Author */}
						{drill.clubName ? (
							<Link
								href={`/dashboard/clubs/${drill.clubId}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted/70 hover:text-white transition-colors group/club">
								<Avatar size="sm" className="size-4">
									{drill.clubLogoUrl ? (
										<AvatarImage src={drill.clubLogoUrl} alt={drill.clubName} />
									) : null}
									<AvatarFallback className="text-[8px]">
										<Building2 size={8} />
									</AvatarFallback>
								</Avatar>
								<span className="truncate group-hover/club:underline">{drill.clubName}</span>
							</Link>
						) : authorName ? (
							<Link
								href={`/dashboard/profile/${drill.author?.id}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted/70 hover:text-white transition-colors group/author">
								<Avatar size="sm" className="size-4">
									{drill.author?.avatarUrl ? (
										<AvatarImage src={drill.author.avatarUrl} alt={authorName} />
									) : null}
									<AvatarFallback className="text-[8px]">
										{drill.author?.firstName?.[0] || drill.author?.lastName?.[0] || <User size={8} />}
									</AvatarFallback>
								</Avatar>
								<span className="truncate group-hover/author:underline">{authorName}</span>
							</Link>
						) : null}
					</div>
					{showAddButton && onAdd && (
						<button
							onClick={handleAdd}
							className="shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted hover:bg-accent hover:text-white transition-colors">
							<Plus size={16} />
						</button>
					)}
				</div>
			</Link>
		);
	}

	return (
		<Link
			href={`/dashboard/training/drills/${drill.id}`}
			className="group block h-full rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all">
			<div className="p-5 h-full flex flex-col">
				{/* Header: Intensity + Category + Add button */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${intensity.classes}`}>
							<IntensityIcon size={12} />
							{intensity.label}
						</span>
						<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${category.classes}`}>
							<CategoryIcon size={12} />
							{category.label}
						</span>
					</div>
					{showAddButton && onAdd && (
						<button
							onClick={handleAdd}
							className="shrink-0 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-muted hover:bg-accent hover:text-white transition-all opacity-0 group-hover:opacity-100">
							<Plus size={14} />
						</button>
					)}
				</div>

				{/* Title */}
				<h3 className="font-semibold text-white text-base leading-snug group-hover:text-accent transition-colors">
					{drill.name}
				</h3>

				{/* Meta: Duration + Players */}
				{(drill.duration || drill.minPlayers) && (
					<div className="flex items-center gap-3 mt-2 text-xs text-muted">
						{drill.duration && (
							<span className="flex items-center gap-1">
								<Clock size={12} />
								<span className="tabular-nums">{drill.duration} min</span>
							</span>
						)}
						{drill.minPlayers && (
							<span className="flex items-center gap-1">
								<Users size={12} />
								<span className="tabular-nums">
									{drill.minPlayers}
									{drill.maxPlayers && drill.maxPlayers !== drill.minPlayers
										? `–${drill.maxPlayers}`
										: "+"}
								</span>
							</span>
						)}
					</div>
				)}

				{/* Description */}
				{drill.description && (
					<p className="text-sm text-muted line-clamp-2 mt-2 leading-relaxed">{drill.description}</p>
				)}

				{/* Spacer to push skills and footer to bottom */}
				<div className="flex-1" />

				{/* Skills */}
				{drill.skills.length > 0 && (
					<div className="flex items-center gap-2 mt-3">
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
				<div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-white/10">
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
		</Link>
	);
}

"use client";

import { Badge } from "@/components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { DifficultyLevel } from "@/lib/models/Template";
import { Clock, Heart, MessageCircle, TrendingUp, Eye, Lock, Building2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrainingPlanTemplate } from "@/lib/models/Template";

const LEVEL_BADGE_COLOR: Record<DifficultyLevel, "success" | "warning" | "error"> = {
	Beginner: "success",
	Intermediate: "warning",
	Advanced: "error",
};

interface TemplateCardProps {
	template: TrainingPlanTemplate;
	href?: string;
	showCreator?: boolean;
	variant?: "default" | "compact";
}

/** Inline nested link replacement — navigates on click without nesting <a> inside <a> */
function InlineLink({
	href,
	className,
	children,
}: {
	href: string;
	className?: string;
	children: React.ReactNode;
}) {
	const router = useRouter();
	return (
		<span
			role="link"
			tabIndex={0}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				router.push(href);
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					e.stopPropagation();
					router.push(href);
				}
			}}
			className={className}>
			{children}
		</span>
	);
}

export default function TemplateCard({ template, href, showCreator = false, variant = "default" }: TemplateCardProps) {
	const cardHref = href || `/dashboard/coaching/training/plans/${template.id}`;

	// Get author display name
	const authorName = template.author?.firstName && template.author?.lastName
		? `${template.author.firstName} ${template.author.lastName}`
		: template.author?.firstName || template.author?.lastName || null;

	// Unified: show club if exists, otherwise author
	const showClub = !!template.clubName;
	const showAuthor = !showClub && !!authorName;

	if (variant === "compact") {
		return (
			<Link
				href={cardHref}
				className="group block p-3 rounded-xl bg-surface hover:bg-hover hover:shadow-md transition-all duration-200">
				<div className="flex-1 min-w-0">
					{/* Header: Level + Visibility */}
					<div className="flex items-center gap-1 mb-1">
						<Badge size="xs" color={LEVEL_BADGE_COLOR[template.level]} variant="ghost" className="text-[10px] px-1.5 py-0 h-4">
							{template.level}
						</Badge>
						{template.visibility === "Private" && (
							<Badge size="xs" color="secondary" variant="ghost" className="text-[10px] px-1.5 py-0 h-4"
								icon={<Lock size={8} />}>
								{template.visibility}
							</Badge>
						)}
					</div>

					{/* Title */}
					<h4 className="font-semibold text-foreground text-base leading-snug group-hover:text-accent transition-colors line-clamp-2">
						{template.name}
					</h4>

					{/* Meta: Duration + Drills */}
					<div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Clock size={11} />
							{template.totalDuration}m
						</span>
						<span>{template.drillCount} {template.drillCount === 1 ? "drill" : "drills"}</span>
					</div>

					{/* Club (priority) or Author */}
					{showClub && (
						<InlineLink
							href={`/dashboard/clubs/${template.clubId}`}
							className="flex items-center gap-1.5 mt-2 py-0.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer group/club">
							<Avatar size="sm" className="size-4">
								{template.clubLogoUrl ? (
									<AvatarImage src={template.clubLogoUrl} alt={template.clubName!} />
								) : null}
								<AvatarFallback className="text-[10px]">
									<Building2 size={10} />
								</AvatarFallback>
							</Avatar>
							<span className="truncate group-hover/club:underline">{template.clubName}</span>
						</InlineLink>
					)}
					{showAuthor && (
						<InlineLink
							href={`/dashboard/profile/${template.author?.id}`}
							className="flex items-center gap-1.5 mt-2 py-0.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer group/source">
							<span className="text-muted-foreground/50">by</span>
							<Avatar size="sm" className="size-4">
								{template.author?.avatarUrl ? (
									<AvatarImage src={template.author.avatarUrl} alt={authorName!} />
								) : null}
								<AvatarFallback className="text-[10px]">
									{template.author?.firstName?.[0] || template.author?.lastName?.[0] || <User size={10} />}
								</AvatarFallback>
							</Avatar>
							<span className="truncate group-hover/source:underline">{authorName}</span>
						</InlineLink>
					)}
				</div>
			</Link>
		);
	}

	// Calculate display values for default variant
	const displaySkills = template.skills.slice(0, 3);
	const remainingSkills = template.skills.length - 3;
	const hasEngagement = template.likeCount > 0 || template.commentCount > 0 || template.usageCount > 0;

	return (
		<Link
			href={cardHref}
			className="group block rounded-2xl bg-surface border border-border hover:border-accent/30 hover:bg-hover hover:shadow-md transition-all duration-200">
			<div className="p-5">
				{/* Header: Level + Duration */}
				<div className="flex items-center justify-between mb-3">
					<Badge size="xs" color={LEVEL_BADGE_COLOR[template.level]} variant="ghost" className="text-[10px] px-1.5 py-0 h-4">
						{template.level}
					</Badge>
					<span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
						<Clock size={14} className="text-muted-foreground" />
						{template.totalDuration}m
					</span>
				</div>

				{/* Title */}
				<h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-accent transition-colors">
					{template.name}
				</h3>

				{/* Description */}
				{template.description && (
					<p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">{template.description}</p>
				)}

				{/* Skills Tags */}
				{template.skills.length > 0 && (
					<div className="flex items-center gap-1.5 mt-3 flex-wrap">
						{displaySkills.map((skill) => (
							<span
								key={skill}
								className="text-xs px-2 py-0.5 rounded-md bg-surface text-muted-foreground border border-border">
								{skill}
							</span>
						))}
						{remainingSkills > 0 && (
							<span className="text-xs px-2 py-0.5 rounded-md bg-surface text-muted-foreground border border-border">
								+{remainingSkills} more
							</span>
						)}
					</div>
				)}

				{/* Footer: Structure + Club/Author */}
				<div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							{template.drillCount} {template.drillCount === 1 ? "drill" : "drills"}
						</span>
						{hasEngagement && (
							<>
								<div className="w-px h-3 bg-border" />
								{template.likeCount > 0 && (
									<span className="flex items-center gap-1 text-rose-400/80">
										<Heart size={11} className="fill-current" />
										{template.likeCount}
									</span>
								)}
								{template.commentCount > 0 && (
									<span className="flex items-center gap-1 text-blue-400/80">
										<MessageCircle size={11} />
										{template.commentCount}
									</span>
								)}
								{template.usageCount > 0 && (
									<span className="flex items-center gap-1 text-emerald-400/80">
										<TrendingUp size={11} />
										{template.usageCount}x
									</span>
								)}
							</>
						)}
					</div>

					{/* Club (priority) or Author */}
					{showClub && (
						<InlineLink
							href={`/dashboard/clubs/${template.clubId}`}
							className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group/club">
							<Avatar size="sm" className="size-5">
								{template.clubLogoUrl ? (
									<AvatarImage src={template.clubLogoUrl} alt={template.clubName!} />
								) : null}
								<AvatarFallback className="text-[10px]">
									<Building2 size={10} />
								</AvatarFallback>
							</Avatar>
							<span className="truncate max-w-[80px] group-hover/club:underline">{template.clubName}</span>
						</InlineLink>
					)}
					{showAuthor && (
						<InlineLink
							href={`/dashboard/profile/${template.author?.id}`}
							className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer group/source">
							<Avatar size="sm" className="size-5">
								{template.author?.avatarUrl ? (
									<AvatarImage src={template.author.avatarUrl} alt={authorName!} />
								) : null}
								<AvatarFallback className="text-[10px]">
									{template.author?.firstName?.[0] || template.author?.lastName?.[0] || <User size={10} />}
								</AvatarFallback>
							</Avatar>
							<span className="truncate max-w-[80px] group-hover/source:underline">{authorName}</span>
						</InlineLink>
					)}
				</div>

				{/* Creator Info (if shown) - Only show if not already displaying author/club above */}
				{showCreator && !authorName && !template.clubName && (
					<div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
						By {template.createdByUserId}
					</div>
				)}
			</div>
		</Link>
	);
}

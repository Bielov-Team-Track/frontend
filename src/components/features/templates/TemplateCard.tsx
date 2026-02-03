"use client";

import { Badge } from "@/components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Heart, MessageCircle, TrendingUp, Eye, Lock, Building2, User } from "lucide-react";
import Link from "next/link";
import { TrainingPlanTemplate } from "@/lib/models/Template";

interface TemplateCardProps {
	template: TrainingPlanTemplate;
	href?: string;
	showCreator?: boolean;
	variant?: "default" | "compact";
}

export default function TemplateCard({ template, href, showCreator = false, variant = "default" }: TemplateCardProps) {
	const cardHref = href || `/dashboard/training/plans/templates/${template.id}`;

	// Calculate display values
	const displaySkills = template.skills.slice(0, 3);
	const remainingSkills = template.skills.length - 3;

	// Get author display name
	const authorName = template.author?.firstName && template.author?.lastName
		? `${template.author.firstName} ${template.author.lastName}`
		: template.author?.firstName || template.author?.lastName || null;

	if (variant === "compact") {
		return (
			<Link
				href={cardHref}
				className="group block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<Badge
								size="xs"
								color={template.visibility === "Public" ? "info" : "secondary"}
								variant="soft"
								icon={template.visibility === "Public" ? <Eye size={10} /> : <Lock size={10} />}>
								{template.visibility}
							</Badge>
						</div>
						<h4 className="font-semibold text-white text-sm group-hover:text-accent transition-colors">
							{template.name}
						</h4>
						<div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
							<span>{template.totalDuration}m</span>
							{displaySkills.length > 0 && (
								<span className="truncate">
									{displaySkills.join(" · ")}
									{remainingSkills > 0 && ` +${remainingSkills}`}
								</span>
							)}
						</div>
						{/* Author Label */}
						{authorName && (
							<Link
								href={`/dashboard/profile/${template.author?.id}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted/70 hover:text-white transition-colors group/source">
								<span className="text-muted/50">by</span>
								<Avatar size="sm" className="size-4">
									{template.author?.avatarUrl ? (
										<AvatarImage src={template.author.avatarUrl} alt={authorName} />
									) : null}
									<AvatarFallback className="text-[8px]">
										{template.author?.firstName?.[0] || template.author?.lastName?.[0] || <User size={8} />}
									</AvatarFallback>
								</Avatar>
								<span className="truncate group-hover/source:underline">{authorName}</span>
							</Link>
						)}
						{/* Club Label */}
						{template.clubName && (
							<Link
								href={`/dashboard/clubs/${template.clubId}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 mt-1 text-[10px] text-muted/70 hover:text-white transition-colors group/club">
								<Avatar size="sm" className="size-4">
									{template.clubLogoUrl ? (
										<AvatarImage src={template.clubLogoUrl} alt={template.clubName} />
									) : null}
									<AvatarFallback className="text-[8px]">
										<Building2 size={8} />
									</AvatarFallback>
								</Avatar>
								<span className="truncate group-hover/club:underline">{template.clubName}</span>
							</Link>
						)}
					</div>
				</div>
			</Link>
		);
	}

	return (
		<Link
			href={cardHref}
			className="group block rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all">
			<div className="p-5">
				{/* Header: Visibility Badge */}
				<div className="flex items-center justify-between mb-3">
					<Badge
						size="xs"
						color={template.visibility === "Public" ? "info" : "secondary"}
						variant="soft"
						icon={template.visibility === "Public" ? <Eye size={11} /> : <Lock size={11} />}>
						{template.visibility}
					</Badge>
				</div>

				{/* Title */}
				<h3 className="font-semibold text-white text-base leading-snug group-hover:text-accent transition-colors">
					{template.name}
				</h3>

				{/* Author Label */}
				{authorName && (
					<Link
						href={`/dashboard/profile/${template.author?.id}`}
						onClick={(e) => e.stopPropagation()}
						className="flex items-center gap-1.5 mt-1 text-xs text-muted/70 hover:text-white transition-colors group/source">
						<span className="text-muted/50">by</span>
						<Avatar size="sm" className="size-5">
							{template.author?.avatarUrl ? (
								<AvatarImage src={template.author.avatarUrl} alt={authorName} />
							) : null}
							<AvatarFallback className="text-[9px]">
								{template.author?.firstName?.[0] || template.author?.lastName?.[0] || <User size={10} />}
							</AvatarFallback>
						</Avatar>
						<span className="truncate group-hover/source:underline">{authorName}</span>
					</Link>
				)}

				{/* Description */}
				{template.description && (
					<p className="text-sm text-muted line-clamp-2 mt-2 leading-relaxed">{template.description}</p>
				)}

				{/* Skills Tags */}
				{template.skills.length > 0 && (
					<div className="flex items-center gap-1.5 mt-3 flex-wrap">
						{displaySkills.map((skill) => (
							<span
								key={skill}
								className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-muted border border-white/10">
								{skill}
							</span>
						))}
						{remainingSkills > 0 && (
							<span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-muted border border-white/10">
								+{remainingSkills} more
							</span>
						)}
					</div>
				)}

				{/* Footer: Meta Info */}
				<div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
					<div className="flex items-center gap-3 text-xs text-muted">
						<span className="flex items-center gap-1">
							<Clock size={12} />
							{template.totalDuration}m
						</span>
						<span className="flex items-center gap-1">
							{template.drillCount} {template.drillCount === 1 ? "drill" : "drills"}
						</span>
						<span className="flex items-center gap-1">
							{template.sectionCount} {template.sectionCount === 1 ? "section" : "sections"}
						</span>
					</div>
				</div>

				{/* Engagement Stats */}
				<div className="flex items-center gap-3 mt-2 text-xs text-muted">
					{/* Club Label */}
					{template.clubName && (
						<>
							<Link
								href={`/dashboard/clubs/${template.clubId}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 text-muted hover:text-white transition-colors group/club">
								<Avatar size="sm" className="size-5">
									{template.clubLogoUrl ? (
										<AvatarImage src={template.clubLogoUrl} alt={template.clubName} />
									) : null}
									<AvatarFallback className="text-[9px]">
										<Building2 size={10} />
									</AvatarFallback>
								</Avatar>
								<span className="truncate max-w-[80px] group-hover/club:underline">{template.clubName}</span>
							</Link>
							<div className="w-px h-4 bg-white/10" />
						</>
					)}
					{template.likeCount > 0 && (
						<span className="flex items-center gap-1 text-rose-400/80">
							<Heart size={12} className="fill-current" />
							{template.likeCount}
						</span>
					)}
					{template.commentCount > 0 && (
						<span className="flex items-center gap-1 text-blue-400/80">
							<MessageCircle size={12} />
							{template.commentCount}
						</span>
					)}
					{template.usageCount > 0 && (
						<span className="flex items-center gap-1 text-emerald-400/80">
							<TrendingUp size={12} />
							Used {template.usageCount}x
						</span>
					)}
				</div>

				{/* Creator Info (if shown) - Only show if not already displaying author label above */}
				{showCreator && !authorName && (
					<div className="text-xs text-muted mt-3 pt-3 border-t border-white/10">
						By {template.createdByUserId}
					</div>
				)}
			</div>
		</Link>
	);
}

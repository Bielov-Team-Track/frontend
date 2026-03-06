"use client";

// TODO: Temporary public page for showing training plans to unauthorized users.
// Once proper public/private access control is implemented, consolidate
// with the dashboard template detail page or use a shared component.

import { useRef } from "react";
import { useParams } from "next/navigation";
import { Badge, Loader } from "@/components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	TemplateInteractionBar,
	TemplateCommentsSection,
} from "@/components/features/templates";
import {
	SessionTimelineSummary,
	DrillSectionsTimeline,
	SideCard,
	getSkillBadgeColor,
	CATEGORY_PILL_COLORS,
	INTENSITY_PILL_COLORS,
	CATEGORY_LABELS,
	INTENSITY_LABELS,
} from "@/components/features/training";
import { usePlan } from "@/hooks/useTemplates";
import { usePlanData } from "@/hooks/usePlanData";
import { AuthProvider } from "@/providers";
import {
	Clock,
	Eye,
	EyeOff,
	User,
	BookOpen,
	Layers,
	Zap,
} from "lucide-react";

export default function PublicTemplatePage() {
	return (
		<AuthProvider>
			<TemplateDetailContent />
		</AuthProvider>
	);
}

function TemplateDetailContent() {
	const params = useParams();
	const templateId = params.id as string;

	const { data: template, isLoading, error } = usePlan(templateId);
	const planData = usePlanData(template);
	const commentsRef = useRef<HTMLDivElement>(null);

	const handleCommentsClick = () => {
		commentsRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader size="lg" />
			</div>
		);
	}

	if (error || !template) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<p className="text-error">Training plan not found.</p>
			</div>
		);
	}

	const authorName = template.author?.firstName && template.author?.lastName
		? `${template.author.firstName} ${template.author.lastName}`
		: template.author?.firstName || template.author?.lastName || null;

	return (
		<div className="flex flex-col gap-6 max-w-[1200px] mx-auto px-4 py-8">
			{/* Header Card */}
			<div className="bg-surface border border-border rounded-2xl p-6">
				<div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
					<div className="flex items-center gap-4 flex-1">
						<Avatar size="lg" className="size-12 shrink-0">
							{template.author?.avatarUrl ? (
								<AvatarImage src={template.author.avatarUrl} alt={authorName || ""} />
							) : template.clubLogoUrl ? (
								<AvatarImage src={template.clubLogoUrl} alt={template.clubName || ""} />
							) : null}
							<AvatarFallback className="text-base font-semibold bg-gradient-to-br from-accent to-teal-600 text-white">
								{authorName ? authorName.split(" ").map(n => n[0]).join("") : <User size={18} />}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
							<div className="text-sm text-muted-foreground mt-0.5">
								{template.clubName ? (
									<span>by {template.clubName}</span>
								) : authorName ? (
									<span>by {authorName}</span>
								) : null}
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<Badge
							color={template.visibility === "Public" ? "info" : "neutral"}
							variant="soft"
							size="md"
							icon={template.visibility === "Public" ? <Eye size={14} /> : <EyeOff size={14} />}>
							{template.visibility}
						</Badge>
						<Badge
							variant="soft"
							size="md"
							color={template.level === "Beginner" ? "success" : template.level === "Advanced" ? "error" : "warning"}
							icon={<Zap size={14} />}>
							{template.level}
						</Badge>
					</div>
				</div>

				{template.description && (
					<p className="text-sm text-muted-foreground leading-relaxed mb-4 pb-4 border-b border-border">
						{template.description}
					</p>
				)}

				<div className="flex flex-wrap items-center gap-5 mb-4 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<Clock size={14} className="text-accent" />
						{template.totalDuration} minutes
					</span>
					<span className="flex items-center gap-1.5">
						<BookOpen size={14} className="text-accent" />
						{template.drillCount} {template.drillCount === 1 ? "drill" : "drills"}
					</span>
					<span className="flex items-center gap-1.5">
						<Layers size={14} className="text-accent" />
						{template.sectionCount} {template.sectionCount === 1 ? "section" : "sections"}
					</span>
				</div>

				<div className="pt-4 border-t border-border">
					<TemplateInteractionBar
						templateId={template.id}
						likeCount={template.likeCount}
						commentCount={template.commentCount}
						onCommentsClick={handleCommentsClick}
					/>
				</div>
			</div>

			{/* Timeline Card */}
			<SessionTimelineSummary
				sections={planData.sections}
				allItemsInOrder={planData.allItemsInOrder}
				categoryDistribution={planData.categoryDistribution}
				intensityDistribution={planData.intensityDistribution}
				totalDuration={planData.totalDuration}
			/>

			{/* Drills + Side Panel */}
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
				<DrillSectionsTimeline
					sections={planData.sections}
					unassignedItems={planData.unassignedItems}
				/>

				{/* Side Panel */}
				<div className="space-y-4 lg:sticky lg:top-6">
					{planData.categoryDistribution.length > 0 && (
						<SideCard title="Categories">
							<div className="space-y-2.5">
								{planData.categoryDistribution.map(([cat, dur]) => {
									const label = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS];
									const color = CATEGORY_PILL_COLORS[cat as keyof typeof CATEGORY_PILL_COLORS];
									if (!label || !color) return null;
									const pct = planData.totalDuration > 0 ? (dur / planData.totalDuration) * 100 : 0;
									return (
										<div key={cat}>
											<div className="flex justify-between text-xs mb-1">
												<span style={{ color }}>{label}</span>
												<span className="text-muted-foreground">{dur}m</span>
											</div>
											<div className="h-1.5 bg-card rounded-full overflow-hidden">
												<div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
											</div>
										</div>
									);
								})}
							</div>
						</SideCard>
					)}

					{planData.intensityDistribution.length > 0 && (
						<SideCard title="Intensity">
							<div className="space-y-2.5">
								{planData.intensityDistribution.map(([int, dur]) => {
									const label = INTENSITY_LABELS[int as keyof typeof INTENSITY_LABELS];
									const color = INTENSITY_PILL_COLORS[int as keyof typeof INTENSITY_PILL_COLORS];
									if (!label || !color) return null;
									const pct = planData.totalDuration > 0 ? (dur / planData.totalDuration) * 100 : 0;
									return (
										<div key={int}>
											<div className="flex justify-between text-xs mb-1">
												<span style={{ color }}>{label}</span>
												<span className="text-muted-foreground">{dur}m</span>
											</div>
											<div className="h-1.5 bg-card rounded-full overflow-hidden">
												<div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
											</div>
										</div>
									);
								})}
							</div>
						</SideCard>
					)}

					{template.skills.length > 0 && (
						<SideCard title="Skills Covered">
							<div className="flex flex-wrap gap-1.5">
								{template.skills.map((skill) => (
									<Badge key={skill} size="xs" color={getSkillBadgeColor(skill)} variant="soft">
										{skill}
									</Badge>
								))}
							</div>
						</SideCard>
					)}
				</div>
			</div>

			{/* Comments */}
			<div ref={commentsRef}>
				<TemplateCommentsSection templateId={template.id} />
			</div>
		</div>
	);
}

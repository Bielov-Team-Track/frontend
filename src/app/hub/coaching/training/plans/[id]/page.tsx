"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components";
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
import {
	usePlan,
	useCanEditPlan,
	useDeletePlan,
} from "@/hooks/useTemplates";
import { usePlanData } from "@/hooks/usePlanData";
import { useAuth } from "@/providers";
import {
	ArrowLeft,
	Clock,
	Edit2,
	Eye,
	EyeOff,
	Trash2,
	User,
	BookOpen,
	Copy,
	Layers,
	Zap,
} from "lucide-react";

export default function TemplateDetailPage() {
	const params = useParams();
	const router = useRouter();
	const templateId = params.id as string;

	const { userProfile } = useAuth();
	const { data: template, isLoading, error } = usePlan(templateId);
	const { canEdit, isLoading: isLoadingPermissions } = useCanEditPlan(template, userProfile?.id);
	const deleteMutation = useDeletePlan();
	const planData = usePlanData(template);

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const commentsRef = useRef<HTMLDivElement>(null);

	const handleDelete = async () => {
		if (!template) return;
		try {
			await deleteMutation.mutateAsync(template.id);
			router.push("/hub/coaching/training/plans");
		} catch (error) {
			console.error("Failed to delete template:", error);
		}
	};

	const handleCommentsClick = () => {
		commentsRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	if (isLoading || isLoadingPermissions) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader size="lg" />
			</div>
		);
	}

	if (error || !template) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<p className="text-error">Failed to load training plan. It may have been deleted.</p>
				<Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => router.push("/hub/coaching/training/plans")}>
					Back to Training Plans
				</Button>
			</div>
		);
	}

	const authorName = template.author?.firstName && template.author?.lastName
		? `${template.author.firstName} ${template.author.lastName}`
		: template.author?.firstName || template.author?.lastName || null;

	return (
		<div className="flex flex-col gap-6 max-w-[1200px] mx-auto pb-8">
			{/* Back button */}
			<div>
				<Link
					href="/hub/coaching/training/plans"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
					<ArrowLeft size={16} />
					Back to Training Plans
				</Link>
			</div>

			{/* ── Header Card ─────────────────────────────────────────────── */}
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
									<Link href={`/hub/clubs/${template.clubId}`} className="hover:text-foreground transition-colors">
										by {template.clubName}
									</Link>
								) : authorName ? (
									<Link href={`/hub/profile/${template.author?.id}`} className="hover:text-foreground transition-colors">
										by {authorName}
									</Link>
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

			{/* ── Timeline Card ────────────────────────────────────────────── */}
			<SessionTimelineSummary
				sections={planData.sections}
				allItemsInOrder={planData.allItemsInOrder}
				categoryDistribution={planData.categoryDistribution}
				intensityDistribution={planData.intensityDistribution}
				totalDuration={planData.totalDuration}
			/>

			{/* ── Drills + Side Panel ────────────────────────────────────────── */}
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
				<DrillSectionsTimeline
					sections={planData.sections}
					unassignedItems={planData.unassignedItems}
				/>

				{/* ── Side Panel ──────────────────────────────────────────────── */}
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

					<SideCard title="Actions">
						<div className="space-y-2">
							{canEdit && (
								<Button
									fullWidth
									size="sm"
									leftIcon={<Edit2 size={14} />}
									onClick={() => router.push(`/hub/coaching/training/plans/wizard?id=${template.id}`)}>
									Edit Plan
								</Button>
							)}
							<Button fullWidth variant="outline" size="sm" leftIcon={<Copy size={14} />}>
								Duplicate
							</Button>
							{canEdit && (
								<Button
									fullWidth
									variant="ghost"
									size="sm"
									color="error"
									leftIcon={<Trash2 size={14} />}
									onClick={() => setShowDeleteConfirm(true)}
									disabled={deleteMutation.isPending}>
									Delete
								</Button>
							)}
						</div>
					</SideCard>
				</div>
			</div>

			{/* ── Comments ──────────────────────────────────────────────────── */}
			<div ref={commentsRef}>
				<TemplateCommentsSection templateId={template.id} />
			</div>

			{/* ── Delete Confirmation ──────────────────────────────────────── */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm">
					<div className="bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-bold text-foreground mb-2">Delete Training Plan?</h3>
						<p className="text-sm text-muted-foreground mb-6">
							Are you sure you want to delete &quot;{template.name}&quot;? This action cannot be undone.
						</p>
						<div className="flex justify-end gap-3">
							<Button variant="ghost" color="neutral" onClick={() => setShowDeleteConfirm(false)}>
								Cancel
							</Button>
							<Button color="error" onClick={handleDelete} loading={deleteMutation.isPending}>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

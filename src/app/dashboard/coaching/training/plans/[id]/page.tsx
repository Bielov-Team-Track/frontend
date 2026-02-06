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
import { DrillCard, type Drill as ComponentDrill } from "@/components/features/drills";
import {
	useTemplate,
	useCanEditTemplate,
	useDeleteTemplate,
	useDeleteTemplateSection,
	useDeleteTemplateItem,
} from "@/hooks/useTemplates";
import { useAuth } from "@/providers";
import { DIFFICULTY_LEVEL_COLORS } from "@/lib/models/Template";
import type { DifficultyLevel } from "@/lib/models/Template";
import {
	ArrowLeft,
	Building2,
	Clock,
	Edit2,
	Eye,
	EyeOff,
	GripVertical,
	Trash2,
	User,
	BookOpen,
	ChevronDown,
	ChevronUp,
	X,
} from "lucide-react";

export default function TemplateDetailPage() {
	const params = useParams();
	const router = useRouter();
	const templateId = params.id as string;

	const { userProfile } = useAuth();
	const { data: template, isLoading, error } = useTemplate(templateId);
	const { canEdit, isLoading: isLoadingPermissions } = useCanEditTemplate(template, userProfile?.id);
	const deleteMutation = useDeleteTemplate();
	const deleteSectionMutation = useDeleteTemplateSection();
	const deleteItemMutation = useDeleteTemplateItem();

	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
	const commentsRef = useRef<HTMLDivElement>(null);

	const handleDelete = async () => {
		if (!template) return;
		try {
			await deleteMutation.mutateAsync(template.id);
			router.push("/dashboard/coaching/training/plans");
		} catch (error) {
			console.error("Failed to delete template:", error);
		}
	};

	const handleCommentsClick = () => {
		commentsRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const toggleSection = (sectionId: string) => {
		setExpandedSections((prev) => {
			const next = new Set(prev);
			if (next.has(sectionId)) {
				next.delete(sectionId);
			} else {
				next.add(sectionId);
			}
			return next;
		});
	};

	const handleDeleteSection = async (sectionId: string) => {
		if (!template) return;
		try {
			await deleteSectionMutation.mutateAsync({ templateId: template.id, sectionId });
		} catch (error) {
			console.error("Failed to delete section:", error);
		}
	};

	const handleDeleteItem = async (itemId: string) => {
		if (!template) return;
		try {
			await deleteItemMutation.mutateAsync({ templateId: template.id, itemId });
		} catch (error) {
			console.error("Failed to delete item:", error);
		}
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
				<Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => router.push("/dashboard/coaching/training/plans")}>
					Back to Training Plans
				</Button>
			</div>
		);
	}

	const authorName = template.author?.firstName && template.author?.lastName
		? `${template.author.firstName} ${template.author.lastName}`
		: template.author?.firstName || template.author?.lastName || null;

	const levelColors = DIFFICULTY_LEVEL_COLORS[template.level as DifficultyLevel] || DIFFICULTY_LEVEL_COLORS.Intermediate;

	// Build sections with their items for display
	const sectionsWithItems = template.sections?.map((section) => ({
		...section,
		items: template.items?.filter((item) => item.sectionId === section.id) || [],
	})) || [];

	// Items without a section
	const unassignedItems = template.items?.filter((item) => !item.sectionId) || [];

	return (
		<div className="flex flex-col gap-6 max-w-5xl mx-auto pb-8">
			{/* Back button */}
			<div>
				<Link
					href="/dashboard/coaching/training/plans"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
					<ArrowLeft size={16} />
					Back to Training Plans
				</Link>
			</div>

			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
				<div className="flex-1">
					{/* Badges */}
					<div className="flex flex-wrap items-center gap-2 mb-3">
						<Badge
							color={template.visibility === "Public" ? "info" : "neutral"}
							variant="ghost"
							icon={template.visibility === "Public" ? <Eye size={12} /> : <EyeOff size={12} />}>
							{template.visibility}
						</Badge>
						<Badge
							className={`${levelColors.bg} ${levelColors.text} ${levelColors.border}`}
							variant="outline">
							{template.level}
						</Badge>
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-foreground">{template.name}</h1>

					{/* Meta */}
					<div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<Clock size={14} className="text-accent" />
							{template.totalDuration} min total
						</span>
						<span className="flex items-center gap-1.5">
							<BookOpen size={14} className="text-accent" />
							{template.drillCount} {template.drillCount === 1 ? "drill" : "drills"}
						</span>
						<span>{template.sectionCount} {template.sectionCount === 1 ? "section" : "sections"}</span>
					</div>

					{/* Author/Club info */}
					<div className="flex items-center gap-4 mt-4">
						{template.clubName ? (
							<Link
								href={`/dashboard/clubs/${template.clubId}`}
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
								<Avatar size="sm" className="size-6">
									{template.clubLogoUrl ? (
										<AvatarImage src={template.clubLogoUrl} alt={template.clubName} />
									) : null}
									<AvatarFallback className="text-[10px]">
										<Building2 size={12} />
									</AvatarFallback>
								</Avatar>
								<span className="group-hover:underline">{template.clubName}</span>
							</Link>
						) : authorName ? (
							<Link
								href={`/dashboard/profile/${template.author?.id}`}
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
								<Avatar size="sm" className="size-6">
									{template.author?.avatarUrl ? (
										<AvatarImage src={template.author.avatarUrl} alt={authorName} />
									) : null}
									<AvatarFallback className="text-[10px]">
										{template.author?.firstName?.[0] || <User size={12} />}
									</AvatarFallback>
								</Avatar>
								<span className="group-hover:underline">{authorName}</span>
							</Link>
						) : null}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 shrink-0">
					<TemplateInteractionBar
						templateId={template.id}
						likeCount={template.likeCount}
						commentCount={template.commentCount}
						onCommentsClick={handleCommentsClick}
					/>
					{canEdit && (
						<>
							<Button
								variant="outline"
								size="sm"
								leftIcon={<Edit2 size={14} />}
								onClick={() => router.push(`/dashboard/coaching/training/plans/wizard?id=${template.id}`)}>
								Edit
							</Button>
							<Button
								variant="ghost"
								size="sm"
								color="error"
								onClick={() => setShowDeleteConfirm(true)}
								disabled={deleteMutation.isPending}>
								<Trash2 size={14} />
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Main content grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left column - Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Description */}
					{template.description && (
						<Section title="Description">
							<p className="text-muted-foreground leading-relaxed">{template.description}</p>
						</Section>
					)}

					{/* Skills */}
					{template.skills.length > 0 && (
						<Section title="Skills Covered">
							<div className="flex flex-wrap gap-2">
								{template.skills.map((skill) => (
									<Badge key={skill} color="neutral" variant="ghost">
										{skill}
									</Badge>
								))}
							</div>
						</Section>
					)}

					{/* Sections with Drills */}
					<Section title="Training Sections">
						<div className="space-y-4">
							{sectionsWithItems.length === 0 && unassignedItems.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">
									No drills added to this training plan yet.
								</p>
							) : (
								<>
									{sectionsWithItems.map((section) => {
										const isExpanded = expandedSections.has(section.id);
										return (
											<div key={section.id} className="rounded-xl border border-border overflow-hidden">
												{/* Section Header */}
												<button
													type="button"
													onClick={() => toggleSection(section.id)}
													className="w-full flex items-center justify-between p-4 bg-card/50 hover:bg-hover transition-colors">
													<div className="flex items-center gap-3">
														<GripVertical size={16} className="text-muted-foreground" />
														<span className="font-medium text-foreground">{section.name}</span>
														<Badge size="xs" color="neutral" variant="ghost">
															{section.items.length} {section.items.length === 1 ? "drill" : "drills"}
														</Badge>
													</div>
													<div className="flex items-center gap-2">
														<span className="text-xs text-muted-foreground">
															{section.duration || section.items.reduce((sum, item) => sum + (item.duration || 0), 0)} min
														</span>
														{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
													</div>
												</button>

												{/* Section Items */}
												{isExpanded && section.items.length > 0 && (
													<div className="p-4 border-t border-border space-y-3">
														{section.items.map((item) => (
															<div key={item.id} className="flex items-start gap-3">
																<GripVertical size={14} className="text-muted-foreground mt-3 shrink-0" />
																<div className="flex-1">
																	{item.drill ? (
																		<DrillCard
																			drill={item.drill as unknown as ComponentDrill}
																			variant="compact"
																			showAddButton={false}
																		/>
																	) : (
																		<div className="p-3 rounded-lg bg-surface border border-border">
																			<p className="text-sm text-muted-foreground">Drill not found</p>
																		</div>
																	)}
																	{item.notes && (
																		<p className="text-xs text-muted-foreground mt-2 italic">
																			Note: {item.notes}
																		</p>
																	)}
																</div>
																<div className="flex items-center gap-2 shrink-0">
																	<span className="text-xs text-muted-foreground">{item.duration} min</span>
																	{canEdit && (
																		<button
																			type="button"
																			onClick={() => handleDeleteItem(item.id)}
																			className="p-1 rounded hover:bg-error/20 text-muted-foreground hover:text-error transition-colors">
																			<X size={12} />
																		</button>
																	)}
																</div>
															</div>
														))}
													</div>
												)}

												{isExpanded && section.items.length === 0 && (
													<div className="p-4 border-t border-border">
														<p className="text-sm text-muted-foreground text-center py-4">
															No drills in this section
														</p>
													</div>
												)}
											</div>
										);
									})}

									{/* Unassigned Items */}
									{unassignedItems.length > 0 && (
										<div className="rounded-xl border border-border overflow-hidden">
											<div className="p-4 bg-card/50">
												<span className="font-medium text-foreground">Other Drills</span>
											</div>
											<div className="p-4 border-t border-border space-y-3">
												{unassignedItems.map((item) => (
													<div key={item.id} className="flex items-start gap-3">
														<div className="flex-1">
															{item.drill ? (
																<DrillCard
																	drill={item.drill as unknown as ComponentDrill}
																	variant="compact"
																	showAddButton={false}
																/>
															) : (
																<div className="p-3 rounded-lg bg-surface border border-border">
																	<p className="text-sm text-muted-foreground">Drill not found</p>
																</div>
															)}
														</div>
														<span className="text-xs text-muted-foreground">{item.duration} min</span>
													</div>
												))}
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</Section>

					{/* Comments Section */}
					<div ref={commentsRef}>
						<TemplateCommentsSection templateId={template.id} />
					</div>
				</div>

				{/* Right column - Summary */}
				<div className="space-y-6">
					<div className="bg-surface border border-border rounded-2xl p-6 sticky top-6">
						<h3 className="font-semibold text-foreground mb-4">Plan Summary</h3>

						<div className="space-y-3">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Total Duration</span>
								<span className="font-medium text-foreground flex items-center gap-1">
									<Clock size={14} className="text-accent" />
									{template.totalDuration} min
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Total Drills</span>
								<span className="font-medium text-foreground">{template.drillCount}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Sections</span>
								<span className="font-medium text-foreground">{template.sectionCount}</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Difficulty</span>
								<Badge
									size="xs"
									className={`${levelColors.bg} ${levelColors.text} ${levelColors.border}`}
									variant="outline">
									{template.level}
								</Badge>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Times Used</span>
								<span className="font-medium text-foreground">{template.usageCount}</span>
							</div>
						</div>

						<hr className="my-4 border-border" />

						<div className="space-y-2">
							{sectionsWithItems.map((section) => (
								<div key={section.id} className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground truncate">{section.name}</span>
									<span className="text-foreground">
										{section.items.length} {section.items.length === 1 ? "drill" : "drills"}
									</span>
								</div>
							))}
						</div>

						{/* Action Buttons */}
						<div className="mt-6 space-y-2">
							<Button fullWidth variant="outline" size="sm">
								Use in Event
							</Button>
							{canEdit && (
								<Button
									fullWidth
									variant="ghost"
									size="sm"
									leftIcon={<Edit2 size={14} />}
									onClick={() => router.push(`/dashboard/coaching/training/plans/wizard?id=${template.id}`)}>
									Edit Plan
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation */}
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

// Section component for consistent styling
function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="bg-surface border border-border rounded-2xl overflow-hidden">
			<div className="p-4 border-b border-border bg-surface">
				<h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h3>
			</div>
			<div className="p-4 md:p-6">{children}</div>
		</div>
	);
}

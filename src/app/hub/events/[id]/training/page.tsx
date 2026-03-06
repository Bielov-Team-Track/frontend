"use client";

import { Button } from "@/components";
import { Badge, EmptyState, Loader } from "@/components/ui";
import { parseTrainingPlanSummary } from "@/lib/models/Event";
import { useEventPlan, useCreateEventPlan, useDeleteEventPlan, usePromoteToTemplate } from "@/hooks/useTemplates";
import { usePlanData } from "@/hooks/usePlanData";
import { showErrorToast, showSuccessToast } from "@/lib/errors";
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
import { TemplateCommentsSection } from "@/components/features/templates";
import {
	Clock,
	ClipboardList,
	Dumbbell,
	Edit2,
	FileDown,
	Layers,
	Play,
	Save,
	Plus,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEventContext } from "../layout";
import { LoadTemplateModal, TrainingViewMode } from "./components";
import type { TrainingPlan, TrainingPlanDetail } from "@/lib/models/Template";
import type { TimelineItem } from "@/components/features/drills";

type PageMode = "overview" | "run";

export default function TrainingPlanPage() {
	const router = useRouter();
	const { eventId, event, isAdmin } = useEventContext();
	const [mode, setMode] = useState<PageMode>("overview");
	const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false);
	const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
	const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

	// Check if the event already has a training plan
	const hasPlan = !!event?.trainingPlanId;
	const planSummary = useMemo(
		() => parseTrainingPlanSummary(event?.trainingPlanSummary),
		[event?.trainingPlanSummary]
	);

	// Fetch the full plan detail when a plan exists
	const { data: eventPlan, isLoading: isPlanLoading } = useEventPlan(eventId, {
		enabled: hasPlan,
	});

	// Computed plan data for the rich view
	const planData = usePlanData(eventPlan);

	// Mutations
	const createEventPlanMutation = useCreateEventPlan();
	const deleteEventPlanMutation = useDeleteEventPlan();
	const promoteToTemplateMutation = usePromoteToTemplate();

	const eventDuration = useMemo(() => {
		if (!event?.startTime || !event?.endTime) return 90;
		const start = new Date(event.startTime);
		const end = new Date(event.endTime);
		return Math.round((end.getTime() - start.getTime()) / 60000);
	}, [event]);

	// Handle loading a template as the event plan
	const handleLoadTemplate = async (template: TrainingPlan) => {
		try {
			await createEventPlanMutation.mutateAsync({
				eventId,
				request: { sourceTemplateId: template.id },
			});
			setShowLoadTemplateModal(false);
			showSuccessToast("Training plan loaded from template");
		} catch (error) {
			showErrorToast(error, { fallback: "Failed to load template" });
		}
	};

	// Handle promoting event plan to a reusable template
	const handlePromoteToTemplate = async () => {
		if (!event?.trainingPlanId) return;
		try {
			await promoteToTemplateMutation.mutateAsync({
				planId: event.trainingPlanId,
			});
			setShowPromoteConfirm(false);
			showSuccessToast("Plan saved as a reusable template");
		} catch (error) {
			showErrorToast(error, { fallback: "Failed to save as template" });
		}
	};

	// Navigate to the wizard for creating a new plan
	const handleCreatePlan = () => {
		router.push(`/hub/coaching/training/plans/wizard?eventId=${eventId}`);
	};

	// Navigate to the wizard for editing the existing plan
	const handleEditPlan = () => {
		if (event?.trainingPlanId) {
			router.push(
				`/hub/coaching/training/plans/wizard?id=${event.trainingPlanId}&eventId=${eventId}`
			);
		}
	};

	// Remove the training plan entirely
	const handleRemovePlan = async () => {
		if (!event?.trainingPlanId) return;
		try {
			await deleteEventPlanMutation.mutateAsync({
				planId: event.trainingPlanId,
				eventId,
			});
			setShowRemoveConfirm(false);
			showSuccessToast("Training plan removed");
		} catch (error) {
			showErrorToast(error, { fallback: "Failed to remove training plan" });
		}
	};

	if (!event) return null;

	// Run mode: use the lazy-loaded TrainingViewMode
	if (mode === "run" && eventPlan) {
		return (
			<RunModeWrapper
				eventPlan={eventPlan}
				onExitToOverview={() => setMode("overview")}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-white">Training Plan</h2>
					<p className="text-sm text-muted">
						{hasPlan
							? "Manage your training session plan"
							: "Set up a training plan for this session"}
					</p>
				</div>
			</div>

			{/* Content based on plan state */}
			{!hasPlan ? (
				<NoPlanState
					onCreatePlan={handleCreatePlan}
					onLoadTemplate={() => setShowLoadTemplateModal(true)}
					isCreating={createEventPlanMutation.isPending}
					isAdmin={isAdmin}
				/>
			) : (
				<PlanExistsState
					planSummary={planSummary}
					eventDuration={eventDuration}
					isPlanLoading={isPlanLoading}
					isAdmin={isAdmin}
					onEdit={handleEditPlan}
					onRun={() => setMode("run")}
					onSaveAsTemplate={() => setShowPromoteConfirm(true)}
					onRemove={() => setShowRemoveConfirm(true)}
					isPromoting={promoteToTemplateMutation.isPending}
					canRun={!!eventPlan && (eventPlan.items?.length ?? 0) > 0}
					planData={planData}
					eventPlan={eventPlan}
					trainingPlanId={event.trainingPlanId!}
				/>
			)}

			{/* Promote to Template Confirmation */}
			{showPromoteConfirm && (
				<PromoteConfirmDialog
					onConfirm={handlePromoteToTemplate}
					onCancel={() => setShowPromoteConfirm(false)}
					isLoading={promoteToTemplateMutation.isPending}
				/>
			)}

			{/* Remove Plan Confirmation */}
			{showRemoveConfirm && (
				<RemovePlanConfirmDialog
					onConfirm={handleRemovePlan}
					onCancel={() => setShowRemoveConfirm(false)}
					isLoading={deleteEventPlanMutation.isPending}
				/>
			)}

			{/* Load Template Modal */}
			<LoadTemplateModal
				isOpen={showLoadTemplateModal}
				onClose={() => setShowLoadTemplateModal(false)}
				onSelectTemplate={handleLoadTemplate}
				clubId={event?.contextType === "Club" ? event?.contextId : undefined}
				isLoading={createEventPlanMutation.isPending}
			/>
		</div>
	);
}

// ─── No Plan State ──────────────────────────────────────────────────────────

function NoPlanState({
	onCreatePlan,
	onLoadTemplate,
	isCreating,
	isAdmin,
}: {
	onCreatePlan: () => void;
	onLoadTemplate: () => void;
	isCreating: boolean;
	isAdmin: boolean;
}) {
	return (
		<div className="rounded-2xl bg-surface border border-border p-12">
			<EmptyState
				icon={ClipboardList}
				title="No training plan yet"
				description={isAdmin
					? "Create a custom training plan or load one from your templates"
					: "The event organizer hasn't added a training plan yet"}
			/>
			{isAdmin && (
				<div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
					<Button
						color="primary"
						leftIcon={<Plus size={16} />}
						onClick={onCreatePlan}
						disabled={isCreating}
					>
						Create Plan
					</Button>
					<Button
						variant="outline"
						color="primary"
						leftIcon={<FileDown size={16} />}
						onClick={onLoadTemplate}
						disabled={isCreating}
					>
						Load from Template
					</Button>
				</div>
			)}
		</div>
	);
}

// ─── Plan Exists State ──────────────────────────────────────────────────────

import type { PlanData } from "@/hooks/usePlanData";

function PlanExistsState({
	planSummary,
	eventDuration,
	isPlanLoading,
	isAdmin,
	onEdit,
	onRun,
	onSaveAsTemplate,
	onRemove,
	isPromoting,
	canRun,
	planData,
	eventPlan,
	trainingPlanId,
}: {
	planSummary: { name: string; totalDuration: number; sectionCount: number; drillCount: number } | null;
	eventDuration: number;
	isPlanLoading: boolean;
	isAdmin: boolean;
	onEdit: () => void;
	onRun: () => void;
	onSaveAsTemplate: () => void;
	onRemove: () => void;
	isPromoting: boolean;
	canRun: boolean;
	planData: PlanData;
	eventPlan: TrainingPlanDetail | undefined;
	trainingPlanId: string;
}) {
	const name = planSummary?.name || "Training Plan";
	const totalDuration = planSummary?.totalDuration || 0;
	const sectionCount = planSummary?.sectionCount || 0;
	const drillCount = planSummary?.drillCount || 0;
	const remainingTime = eventDuration - totalDuration;

	return (
		<div className="space-y-6">
			{/* Plan Summary Card (renders immediately from planSummary) */}
			<div className="rounded-2xl bg-surface border border-border overflow-hidden">
				{/* Duration progress bar */}
				{totalDuration > 0 && (
					<div className="h-1 bg-hover">
						<div
							className={`h-full transition-all ${
								remainingTime < 0 ? "bg-error" : "bg-accent"
							}`}
							style={{
								width: `${Math.min(
									(totalDuration / eventDuration) * 100,
									100
								)}%`,
							}}
						/>
					</div>
				)}

				<div className="p-6">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div className="flex-1 min-w-0">
							<h3 className="text-lg font-bold text-white truncate">
								{name}
							</h3>

							{/* Stats */}
							<div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted">
								<span className="flex items-center gap-1.5">
									<Clock size={14} className="text-accent" />
									{totalDuration} min
									{totalDuration > 0 && eventDuration > 0 && (
										<span
											className={`text-xs ${
												remainingTime < 0
													? "text-error"
													: "text-muted"
											}`}
										>
											{remainingTime < 0
												? `(${Math.abs(remainingTime)}m over)`
												: `(${remainingTime}m remaining)`}
										</span>
									)}
								</span>
								<span className="flex items-center gap-1.5">
									<Dumbbell size={14} className="text-accent" />
									{drillCount}{" "}
									{drillCount === 1 ? "drill" : "drills"}
								</span>
								{sectionCount > 0 && (
									<span className="flex items-center gap-1.5">
										<Layers size={14} className="text-accent" />
										{sectionCount}{" "}
										{sectionCount === 1
											? "section"
											: "sections"}
									</span>
								)}
							</div>
						</div>

						{/* Primary action */}
						<div className="shrink-0">
							<Button
								color="primary"
								leftIcon={<Play size={16} />}
								onClick={onRun}
								disabled={!canRun || isPlanLoading}
							>
								{isPlanLoading ? "Loading..." : "Run Session"}
							</Button>
						</div>
					</div>

					{/* Action bar */}
					{isAdmin && (
						<div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
							<Button
								variant="outline"
								color="neutral"
								size="sm"
								leftIcon={<Edit2 size={14} />}
								onClick={onEdit}
							>
								Edit Plan
							</Button>
							<Button
								variant="ghost"
								color="neutral"
								size="sm"
								leftIcon={<Save size={14} />}
								onClick={onSaveAsTemplate}
								disabled={isPromoting}
							>
								{isPromoting
									? "Saving..."
									: "Save as Template"}
							</Button>
							<div className="flex-1" />
							<Button
								variant="destructive"
								size="sm"
								leftIcon={<Trash2 size={14} />}
								onClick={onRemove}
							>
								Remove Plan
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Progressive-loaded rich view (waits for eventPlan) */}
			{isPlanLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader size="lg" />
				</div>
			) : eventPlan ? (
				<>
					{/* Session Timeline */}
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

							{planData.skills.length > 0 && (
								<SideCard title="Skills Covered">
									<div className="flex flex-wrap gap-1.5">
										{planData.skills.map((skill) => (
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
					<TemplateCommentsSection templateId={trainingPlanId} />
				</>
			) : null}
		</div>
	);
}

// ─── Promote Confirmation Dialog ────────────────────────────────────────────

function PromoteConfirmDialog({
	onConfirm,
	onCancel,
	isLoading,
}: {
	onConfirm: () => void;
	onCancel: () => void;
	isLoading: boolean;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60"
				onClick={!isLoading ? onCancel : undefined}
			/>

			{/* Dialog */}
			<div className="relative z-10 w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-xl mx-4">
				<h3 className="text-lg font-bold text-white mb-2">
					Save as Template
				</h3>
				<p className="text-sm text-muted mb-6">
					This will create a copy of the current training plan as a
					reusable template. You can then use it for other events or
					share it with your club.
				</p>
				<div className="flex gap-3 justify-end">
					<Button
						variant="outline"
						color="neutral"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						color="primary"
						onClick={onConfirm}
						disabled={isLoading}
					>
						{isLoading ? "Saving..." : "Save as Template"}
					</Button>
				</div>
			</div>
		</div>
	);
}

// ─── Remove Plan Confirmation Dialog ────────────────────────────────────────

function RemovePlanConfirmDialog({
	onConfirm,
	onCancel,
	isLoading,
}: {
	onConfirm: () => void;
	onCancel: () => void;
	isLoading: boolean;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60"
				onClick={!isLoading ? onCancel : undefined}
			/>

			{/* Dialog */}
			<div className="relative z-10 w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-xl mx-4">
				<h3 className="text-lg font-bold text-white mb-2">
					Remove Training Plan
				</h3>
				<p className="text-sm text-muted mb-6">
					This will permanently remove the training plan from this
					event. All drills, sections, and changes will be lost. This
					action cannot be undone.
				</p>
				<div className="flex gap-3 justify-end">
					<Button
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						loading={isLoading}
					>
						{isLoading ? "Removing..." : "Remove Plan"}
					</Button>
				</div>
			</div>
		</div>
	);
}

// ─── Run Mode Wrapper ───────────────────────────────────────────────────────
// Maps plan items to timeline items for TrainingViewMode

function RunModeWrapper({
	eventPlan,
	onExitToOverview,
}: {
	eventPlan: TrainingPlanDetail;
	onExitToOverview: () => void;
}) {
	const timeline = useMemo((): TimelineItem[] => {
		if (!eventPlan?.items) return [];
		return eventPlan.items
			.filter((item) => item.drill)
			.map((item) => ({
				...(item.drill as unknown as TimelineItem),
				instanceId: item.id,
				duration: item.duration,
			}));
	}, [eventPlan]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-white">Training Plan</h2>
					<p className="text-sm text-muted">Running training session</p>
				</div>
				<Button
					variant="outline"
					color="neutral"
					size="sm"
					leftIcon={<Edit2 size={14} />}
					onClick={onExitToOverview}
				>
					Back to Overview
				</Button>
			</div>

			<TrainingViewMode
				timeline={timeline}
				onExitToEdit={onExitToOverview}
			/>
		</div>
	);
}

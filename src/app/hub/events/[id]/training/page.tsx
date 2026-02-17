"use client";

import { Button } from "@/components";
import { EmptyState } from "@/components/ui";
import { parseTrainingPlanSummary } from "@/lib/models/Event";
import { useEventPlan, useCreateEventPlan, usePromoteToTemplate } from "@/hooks/useTemplates";
import { showErrorToast, showSuccessToast } from "@/lib/errors";
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

	// Check if the event already has a training plan
	const hasPlan = !!event?.trainingPlanId;
	const planSummary = useMemo(
		() => parseTrainingPlanSummary(event?.trainingPlanSummary),
		[event?.trainingPlanSummary]
	);

	// Fetch the full plan detail when a plan exists (for the run mode)
	const { data: eventPlan, isLoading: isPlanLoading } = useEventPlan(eventId, {
		enabled: hasPlan,
	});

	// Mutations
	const createEventPlanMutation = useCreateEventPlan();
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

	if (!event) return null;

	// Run mode: use the lazy-loaded TrainingViewMode (imported dynamically to avoid loading when not needed)
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
					isPromoting={promoteToTemplateMutation.isPending}
					canRun={!!eventPlan && (eventPlan.items?.length ?? 0) > 0}
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
}: {
	onCreatePlan: () => void;
	onLoadTemplate: () => void;
	isCreating: boolean;
}) {
	return (
		<div className="rounded-2xl bg-surface border border-border p-12">
			<EmptyState
				icon={ClipboardList}
				title="No training plan yet"
				description="Create a custom training plan or load one from your templates"
			/>
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
		</div>
	);
}

// ─── Plan Exists State ──────────────────────────────────────────────────────

function PlanExistsState({
	planSummary,
	eventDuration,
	isPlanLoading,
	isAdmin,
	onEdit,
	onRun,
	onSaveAsTemplate,
	isPromoting,
	canRun,
}: {
	planSummary: { name: string; totalDuration: number; sectionCount: number; drillCount: number } | null;
	eventDuration: number;
	isPlanLoading: boolean;
	isAdmin: boolean;
	onEdit: () => void;
	onRun: () => void;
	onSaveAsTemplate: () => void;
	isPromoting: boolean;
	canRun: boolean;
}) {
	const name = planSummary?.name || "Training Plan";
	const totalDuration = planSummary?.totalDuration || 0;
	const sectionCount = planSummary?.sectionCount || 0;
	const drillCount = planSummary?.drillCount || 0;
	const remainingTime = eventDuration - totalDuration;

	return (
		<div className="space-y-4">
			{/* Plan Summary Card */}
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
						</div>
					)}
				</div>
			</div>
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

// ─── Run Mode Wrapper ───────────────────────────────────────────────────────
// Maps plan items to timeline items for TrainingViewMode

function RunModeWrapper({
	eventPlan,
	onExitToOverview,
}: {
	eventPlan: TrainingPlanDetail;
	onExitToOverview: () => void;
}) {
	// Convert plan items to timeline items for TrainingViewMode
	// The model Drill and features/drills Drill have compatible runtime shapes
	// for the properties used by TrainingViewMode (name, duration, category, intensity, skills, description)
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

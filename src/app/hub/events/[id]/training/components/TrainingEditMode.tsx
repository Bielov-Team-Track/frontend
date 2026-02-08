"use client";

import { Button } from "@/components";
import {
	CATEGORY_COLORS,
	Drill,
	DrillCard,
	DrillDetailModal,
	DrillSkill,
	INTENSITY_COLORS,
	MOCK_DRILLS,
	SkillFilter,
	TimelineItem,
} from "@/components/features/drills";
import { Badge, EmptyState } from "@/components/ui";
import { Clock, Dumbbell, GripVertical, Play, Trash2, FileDown, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useEventContext } from "../../layout";
import { useSaveEventPlanAsTemplate, useLoadTemplateToEvent } from "@/hooks/useTemplates";
import LoadTemplateModal from "./LoadTemplateModal";
import SaveAsTemplateModal, { SaveTemplateData } from "./SaveAsTemplateModal";
import LoadTemplateConfirmModal from "./LoadTemplateConfirmModal";
import { TrainingPlanTemplate } from "@/lib/models/Template";

interface TrainingEditModeProps {
	timeline: TimelineItem[];
	setTimeline: React.Dispatch<React.SetStateAction<TimelineItem[]>>;
	eventDuration: number;
	onStartTraining: () => void;
}

export default function TrainingEditMode({ timeline, setTimeline, eventDuration, onStartTraining }: TrainingEditModeProps) {
	const { eventId, event } = useEventContext();
	const [selectedSkills, setSelectedSkills] = useState<DrillSkill[]>([]);
	const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);

	// Modal states
	const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false);
	const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
	const [showLoadConfirmModal, setShowLoadConfirmModal] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<TrainingPlanTemplate | null>(null);

	// Template mutations
	const saveAsTemplateMutation = useSaveEventPlanAsTemplate();
	const loadTemplateMutation = useLoadTemplateToEvent();

	// Computed values
	const plannedDuration = timeline.reduce((acc, item) => acc + item.duration, 0);
	const remainingTime = eventDuration - plannedDuration;
	const progressPercent = Math.min((plannedDuration / eventDuration) * 100, 100);

	// Filter drills
	const filteredDrills = useMemo(() => {
		if (selectedSkills.length === 0) return MOCK_DRILLS;
		return MOCK_DRILLS.filter((drill) => drill.skills.some((skill) => selectedSkills.includes(skill)));
	}, [selectedSkills]);

	// Handlers
	const addToTimeline = (drill: Drill) => {
		const newItem: TimelineItem = {
			...drill,
			instanceId: Math.random().toString(36).substring(2, 11),
		};
		setTimeline((prev) => [...prev, newItem]);
	};

	const removeFromTimeline = (instanceId: string) => {
		setTimeline((prev) => prev.filter((item) => item.instanceId !== instanceId));
	};

	// Template handlers
	const handleLoadTemplate = (template: TrainingPlanTemplate) => {
		if (timeline.length === 0) {
			// Timeline is empty, load directly
			loadTemplate(template.id, true);
		} else {
			// Timeline has drills, show confirmation modal
			setSelectedTemplate(template);
			setShowLoadTemplateModal(false);
			setShowLoadConfirmModal(true);
		}
	};

	const handleLoadConfirm = (replace: boolean) => {
		if (selectedTemplate) {
			loadTemplate(selectedTemplate.id, replace);
			setSelectedTemplate(null);
		}
	};

	const loadTemplate = async (templateId: string, replace: boolean) => {
		try {
			await loadTemplateMutation.mutateAsync({
				eventId,
				templateId,
				replace,
			});
			// TODO: Show success toast
			// TODO: Refresh timeline data from backend
		} catch (error) {
			console.error("Failed to load template:", error);
			// TODO: Show error toast
		}
	};

	const handleSaveAsTemplate = async (data: SaveTemplateData) => {
		try {
			const result = await saveAsTemplateMutation.mutateAsync({
				eventId,
				data,
			});
			setShowSaveTemplateModal(false);
			// TODO: Show success toast with link to template
			console.log("Template saved:", result);
		} catch (error) {
			console.error("Failed to save template:", error);
			// TODO: Show error toast
		}
	};

	return (
		<>
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left: Drill Library */}
				<div className="lg:col-span-4 space-y-6">
					{/* Skill Filter */}
					<div className="rounded-2xl bg-surface border border-border p-5">
						<SkillFilter selectedSkills={selectedSkills} onSelectedSkillsChange={setSelectedSkills} />
						{selectedSkills.length > 0 && (
							<button
								onClick={() => setSelectedSkills([])}
								className="mt-3 text-xs text-accent hover:underline">
								Clear filters
							</button>
						)}
					</div>

					{/* Drill List */}
					<div className="rounded-2xl bg-surface border border-border overflow-hidden flex flex-col max-h-[600px]">
						<div className="p-4 border-b border-border">
							<h3 className="font-bold text-white">Drill Library</h3>
							<p className="text-xs text-muted mt-1">{filteredDrills.length} drills available</p>
						</div>

						<div className="flex-1 overflow-y-auto p-3 space-y-2">
							{filteredDrills.length === 0 ? (
								<p className="p-4 text-center text-muted text-sm">No drills match your selection.</p>
							) : (
								filteredDrills.map((drill) => (
									<DrillCard
										key={drill.id}
										drill={drill}
										variant="compact"
										onClick={() => setSelectedDrill(drill)}
										onAdd={addToTimeline}
									/>
								))
							)}
						</div>
					</div>
				</div>

				{/* Right: Timeline */}
				<div className="lg:col-span-8 space-y-6">
					{/* Time Budget with Template Actions */}
					<TimeBudgetCard
						plannedDuration={plannedDuration}
						eventDuration={eventDuration}
						remainingTime={remainingTime}
						progressPercent={progressPercent}
						onClear={timeline.length > 0 ? () => setTimeline([]) : undefined}
						onLoadTemplate={() => setShowLoadTemplateModal(true)}
					/>

					{/* Timeline */}
					{timeline.length === 0 ? (
						<div className="rounded-2xl bg-surface border border-border p-12">
							<EmptyState
								icon={Dumbbell}
								title="Your timeline is empty"
								description="Select drills from the library or load a template to get started"
							/>
							<div className="flex justify-center gap-3 mt-6">
								<Button
									variant="outline"
									color="primary"
									leftIcon={<FileDown size={16} />}
									onClick={() => setShowLoadTemplateModal(true)}>
									Use Template
								</Button>
							</div>
						</div>
					) : (
						<TimelineList
							timeline={timeline}
							onDrillClick={setSelectedDrill}
							onRemove={removeFromTimeline}
						/>
					)}

					{/* Actions */}
					{timeline.length > 0 && (
						<div className="flex justify-between gap-3 pt-4">
							<Button
								variant="outline"
								color="neutral"
								leftIcon={<Save size={16} />}
								onClick={() => setShowSaveTemplateModal(true)}>
								Save as Template
							</Button>
							<div className="flex gap-3">
								<Button variant="outline" color="primary">
									Save Plan
								</Button>
								<Button color="primary" leftIcon={<Play size={16} />} onClick={onStartTraining}>
									Start Training
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Modals */}
			<LoadTemplateModal
				isOpen={showLoadTemplateModal}
				onClose={() => setShowLoadTemplateModal(false)}
				onSelectTemplate={handleLoadTemplate}
				clubId={event?.contextType === "Club" ? event?.contextId : undefined}
			/>

			<SaveAsTemplateModal
				isOpen={showSaveTemplateModal}
				onClose={() => setShowSaveTemplateModal(false)}
				onSave={handleSaveAsTemplate}
				isLoading={saveAsTemplateMutation.isPending}
				clubs={[]} // TODO: Fetch user's clubs where they can create templates
			/>

			<LoadTemplateConfirmModal
				isOpen={showLoadConfirmModal}
				onClose={() => {
					setShowLoadConfirmModal(false);
					setSelectedTemplate(null);
				}}
				onConfirm={handleLoadConfirm}
				templateName={selectedTemplate?.name || ""}
			/>

			<DrillDetailModal
				drill={selectedDrill}
				isOpen={!!selectedDrill}
				onClose={() => setSelectedDrill(null)}
				onAddToTimeline={addToTimeline}
				showAddButton
			/>
		</>
	);
}

// Sub-components for better organization

function TimeBudgetCard({
	plannedDuration,
	eventDuration,
	remainingTime,
	progressPercent,
	onClear,
	onLoadTemplate,
}: {
	plannedDuration: number;
	eventDuration: number;
	remainingTime: number;
	progressPercent: number;
	onClear?: () => void;
	onLoadTemplate?: () => void;
}) {
	const isOver = remainingTime < 0;

	return (
		<div className="rounded-2xl bg-surface border border-border p-6 relative overflow-hidden">
			<div
				className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isOver ? "bg-error" : "bg-accent"}`}
				style={{ width: `${progressPercent}%` }}
			/>

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
				<div>
					<h2 className="text-xl font-bold text-white">Session Timeline</h2>
					<p className="text-sm text-muted">Add drills to build your training plan</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="text-right">
						<div className={`text-2xl font-bold ${isOver ? "text-error" : "text-white"}`}>
							{plannedDuration}
							<span className="text-lg text-muted font-medium">/{eventDuration}m</span>
						</div>
						<div className="text-xs font-bold uppercase tracking-wider text-muted">
							{isOver ? `${Math.abs(remainingTime)}m over` : `${remainingTime}m remaining`}
						</div>
					</div>

					{onLoadTemplate && (
						<Button variant="ghost" color="neutral" size="sm" leftIcon={<FileDown size={14} />} onClick={onLoadTemplate}>
							Load Template
						</Button>
					)}

					{onClear && (
						<Button variant="ghost" color="neutral" size="sm" onClick={onClear}>
							Clear All
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

function TimelineList({
	timeline,
	onDrillClick,
	onRemove,
}: {
	timeline: TimelineItem[];
	onDrillClick: (drill: Drill) => void;
	onRemove: (instanceId: string) => void;
}) {
	return (
		<div className="relative pl-6 border-l-2 border-border space-y-4 min-h-[200px]">
			{/* Start node */}
			<div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-background" />

			{timeline.map((item, index) => {
				const accumulatedTime = timeline.slice(0, index).reduce((a, b) => a + b.duration, 0);
				const timeLabel = formatTime(accumulatedTime);

				return (
					<div key={item.instanceId} className="relative animate-in slide-in-from-left-2 duration-300">
						<div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-muted/50 border-2 border-background" />
						<div className="absolute -left-20 top-5 text-xs font-mono text-muted w-12 text-right">{timeLabel}</div>

						<div
							onClick={() => onDrillClick(item)}
							className="group ml-4 rounded-xl bg-surface border border-border p-4 hover:border-accent/50 transition-all cursor-pointer">
							<div className="flex items-start gap-4">
								<GripVertical size={18} className="text-muted/50 mt-1 cursor-grab" />

								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between gap-2">
										<h4 className="font-bold text-white">{item.name}</h4>
										<Badge size="xs" color={INTENSITY_COLORS[item.intensity].color} variant="outline">
											{item.intensity}
										</Badge>
									</div>
									<div className="flex items-center gap-3 mt-1 text-sm text-muted">
										<span className="flex items-center gap-1">
											<Clock size={14} /> {item.duration} mins
										</span>
										<Badge size="xs" color={CATEGORY_COLORS[item.category].color} variant="ghost">
											{item.category}
										</Badge>
									</div>
									<p className="text-xs text-muted/70 mt-2 line-clamp-1">{item.description}</p>
								</div>

								<button
									onClick={(e) => {
										e.stopPropagation();
										onRemove(item.instanceId);
									}}
									className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					</div>
				);
			})}

			{/* End node */}
			<div className="absolute -left-[9px] bottom-0 w-4 h-4 rounded-full bg-muted/50 border-4 border-background" />
		</div>
	);
}

function formatTime(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

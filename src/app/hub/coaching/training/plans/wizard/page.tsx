"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, TextArea, Card } from "@/components";
import { Loader } from "@/components/ui";
import {
	SessionOverviewBar,
	DrillLibraryPanel,
	TimelineBuilderPanel,
	KeyboardShortcutsOverlay,
	type TimelineItem,
	type Section,
} from "@/components/features/training";
import { DrillDetailModal } from "@/components/features/drills";
import { useCreatePlan, useUpdatePlan, usePlan, useCreateEventPlan } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import { getClubs } from "@/lib/api/clubs";
import type { Drill } from "@/lib/models/Drill";
import type { PlanVisibility } from "@/lib/models/Template";
import { ArrowLeft, Save, ChevronDown, ChevronUp, Cloud, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { showErrorToast } from "@/lib/errors";

const SECTION_COLORS = ["#FF7D00", "#29757A", "#2E5A88", "#D99100", "#4A7A45", "#BE3F23"];

const AUTOSAVE_KEY_NEW = "training-plan-wizard-draft-new";
const AUTOSAVE_KEY_EDIT_PREFIX = "training-plan-wizard-draft-edit-";
const AUTOSAVE_KEY_EVENT_PREFIX = "training-plan-wizard-draft-event-";
const AUTOSAVE_DEBOUNCE_MS = 1000;

interface DraftData {
	name: string;
	description: string;
	clubId: string;
	visibility: PlanVisibility;
	sessionDuration: number;
	timeline: TimelineItem[];
	sections: Section[];
	savedAt: number;
}

export default function TrainingPlanWizardPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const editId = searchParams.get("id");
	const eventId = searchParams.get("eventId");
	const isEditMode = !!editId;
	const isEventMode = !!eventId;

	// API hooks
	const { data: existingTemplate, isLoading: isLoadingTemplate } = usePlan(editId || "", isEditMode);
	const createMutation = useCreatePlan();
	const updateMutation = useUpdatePlan();
	const createEventPlanMutation = useCreateEventPlan();
	const { data: myClubs = [] } = useQuery({
		queryKey: ["clubs"],
		queryFn: getClubs,
	});

	// Template details state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [clubId, setClubId] = useState<string>("");
	const [visibility, setVisibility] = useState<PlanVisibility>("Private");
	const [detailsExpanded, setDetailsExpanded] = useState(true);

	// Session state
	const [sessionDuration, setSessionDuration] = useState(90);
	const [timeline, setTimeline] = useState<TimelineItem[]>([]);
	const [sections, setSections] = useState<Section[]>([]);

	// Drill detail drawer
	const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);

	// Keyboard shortcuts overlay
	const [showShortcuts, setShowShortcuts] = useState(false);

	// Mobile tab switcher
	const [mobileTab, setMobileTab] = useState<"timeline" | "library">("timeline");

	// Autosave state
	const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
	const [draftLoaded, setDraftLoaded] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Get the appropriate localStorage key
	const autosaveKey = isEditMode && editId
		? `${AUTOSAVE_KEY_EDIT_PREFIX}${editId}`
		: isEventMode && eventId
			? `${AUTOSAVE_KEY_EVENT_PREFIX}${eventId}`
			: AUTOSAVE_KEY_NEW;

	// Load existing template data in edit mode
	useEffect(() => {
		if (existingTemplate && !draftLoaded) {
			// Check if there's a local draft that's newer
			let useDraft = false;
			let draft: DraftData | null = null;

			try {
				const saved = localStorage.getItem(autosaveKey);
				if (saved) {
					draft = JSON.parse(saved);
					const templateUpdated = new Date(existingTemplate.updatedAt || existingTemplate.createdAt).getTime();
					if (draft && draft.savedAt > templateUpdated) {
						useDraft = confirm(
							"You have unsaved changes from a previous session. Would you like to restore them?\n\n" +
							"Click OK to restore your draft, or Cancel to use the saved version."
						);
					}
				}
			} catch (e) {
				console.error("Failed to check draft:", e);
			}

			if (useDraft && draft) {
				// Use the local draft
				setName(draft.name || "");
				setDescription(draft.description || "");
				setClubId(draft.clubId || "");
				setVisibility(draft.visibility || "Private");
				setSessionDuration(draft.sessionDuration || 90);
				setTimeline(draft.timeline || []);
				setSections(draft.sections || []);
				setLastSavedAt(draft.savedAt);
				setHasUnsavedChanges(true);
			} else {
				// Use server data
				setName(existingTemplate.name);
				setDescription(existingTemplate.description || "");
				setClubId(existingTemplate.clubId || "");
				setVisibility(existingTemplate.visibility);

				// Convert template sections to local sections
				const loadedSections: Section[] = (existingTemplate.sections || []).map((s, idx) => ({
					id: s.id,
					name: s.name,
					color: SECTION_COLORS[idx % SECTION_COLORS.length],
				}));
				setSections(loadedSections);

				// Convert template items to timeline items
				const loadedTimeline: TimelineItem[] = (existingTemplate.items || [])
					.filter((item) => item.drill)
					.map((item) => ({
						instanceId: item.id,
						drill: item.drill!,
						duration: item.duration,
						notes: item.notes || "",
						sectionId: item.sectionId,
					}));
				setTimeline(loadedTimeline);

				// Calculate session duration from items
				const totalDuration = loadedTimeline.reduce((sum, item) => sum + item.duration, 0);
				setSessionDuration(Math.max(90, Math.ceil(totalDuration / 30) * 30));

				// Clear any stale draft
				try {
					localStorage.removeItem(autosaveKey);
				} catch (e) {
					// Ignore
				}
			}

			// Collapse details if we have data
			setDetailsExpanded(false);
			setDraftLoaded(true);
		}
	}, [existingTemplate, draftLoaded, autosaveKey]);

	// Load draft from localStorage on mount (only for new templates)
	useEffect(() => {
		if (isEditMode || draftLoaded) return;

		try {
			const saved = localStorage.getItem(autosaveKey);
			if (saved) {
				const draft: DraftData = JSON.parse(saved);
				setName(draft.name || "");
				setDescription(draft.description || "");
				setClubId(draft.clubId || "");
				setVisibility(draft.visibility || "Private");
				setSessionDuration(draft.sessionDuration || 90);
				setTimeline(draft.timeline || []);
				setSections(draft.sections || []);
				setLastSavedAt(draft.savedAt);

				// Collapse details if we have a name
				if (draft.name) {
					setDetailsExpanded(false);
				}
			}
		} catch (e) {
			console.error("Failed to load draft:", e);
		}
		setDraftLoaded(true);
	}, [isEditMode, draftLoaded, autosaveKey]);

	// Autosave to localStorage (debounced)
	useEffect(() => {
		// Don't autosave before initial load
		if (!draftLoaded) return;

		// Clear previous timeout
		if (autosaveTimeoutRef.current) {
			clearTimeout(autosaveTimeoutRef.current);
		}

		// Debounce the save
		autosaveTimeoutRef.current = setTimeout(() => {
			try {
				const draft: DraftData = {
					name,
					description,
					clubId,
					visibility,
					sessionDuration,
					timeline,
					sections,
					savedAt: Date.now(),
				};
				localStorage.setItem(autosaveKey, JSON.stringify(draft));
				setLastSavedAt(draft.savedAt);
				setHasUnsavedChanges(true);
			} catch (e) {
				console.error("Failed to save draft:", e);
			}
		}, AUTOSAVE_DEBOUNCE_MS);

		return () => {
			if (autosaveTimeoutRef.current) {
				clearTimeout(autosaveTimeoutRef.current);
			}
		};
	}, [name, description, clubId, visibility, sessionDuration, timeline, sections, draftLoaded, autosaveKey]);

	// Clear draft after successful save
	const clearDraft = useCallback(() => {
		try {
			localStorage.removeItem(autosaveKey);
			setLastSavedAt(null);
			setHasUnsavedChanges(false);
		} catch (e) {
			console.error("Failed to clear draft:", e);
		}
	}, [autosaveKey]);

	// Save template - defined before keyboard shortcuts useEffect that references it
	const handleSave = useCallback(async () => {
		if (!name.trim()) {
			showErrorToast(new Error("Please enter a plan name"), { message: "Please enter a plan name" });
			return;
		}

		try {
			// Build sections DTO
			const sectionsDto = sections.map((section, idx) => ({
				id: section.id,
				name: section.name,
				order: idx,
			}));

			// Build items DTO
			const itemsDto = timeline.map((item, idx) => ({
				id: isEditMode ? (item.instanceId.startsWith("item-") ? undefined : item.instanceId) : undefined,
				drillId: item.drill.id,
				sectionId: item.sectionId,
				duration: item.duration,
				notes: item.notes || undefined,
				order: idx,
			}));

			if (isEditMode && editId) {
				// Edit mode: update existing plan (works for both templates and event plans)
				await updateMutation.mutateAsync({
					id: editId,
					data: {
						name: name.trim(),
						description: description.trim() || undefined,
						clubId: clubId || undefined,
						visibility: isEventMode ? undefined : visibility,
						sections: sectionsDto.length > 0 ? sectionsDto : undefined,
						items: itemsDto.length > 0 ? itemsDto : undefined,
					},
				});
				clearDraft();
				if (isEventMode && eventId) {
					router.push(`/hub/events/${eventId}/training`);
				} else {
					router.push(`/hub/coaching/training/plans/${editId}`);
				}
			} else if (isEventMode && eventId) {
				// Event mode: create event plan
				await createEventPlanMutation.mutateAsync({
					eventId,
					request: {
						name: name.trim() || undefined,
						description: description.trim() || undefined,
						sections: sectionsDto.length > 0 ? sectionsDto : undefined,
						items: itemsDto.length > 0 ? itemsDto : undefined,
					},
				});
				clearDraft();
				router.push(`/hub/events/${eventId}/training`);
			} else {
				// Template mode: create new template
				const result = await createMutation.mutateAsync({
					name: name.trim(),
					description: description.trim() || undefined,
					clubId: clubId || undefined,
					visibility,
					sections: sectionsDto.length > 0 ? sectionsDto : undefined,
					items: itemsDto.length > 0 ? itemsDto : undefined,
				});
				clearDraft();
				router.push(`/hub/coaching/training/plans/${result.id}`);
			}
		} catch (error) {
			console.error("Failed to save plan:", error);
			showErrorToast(error, { fallback: "Failed to save plan. Please try again." });
		}
	}, [name, description, clubId, visibility, sections, timeline, isEditMode, isEventMode, editId, eventId, router, createMutation, updateMutation, createEventPlanMutation, clearDraft]);

	// Keyboard shortcuts handler
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if user is typing in an input/textarea
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
				// Allow Ctrl+S even in inputs
				if ((e.ctrlKey || e.metaKey) && e.key === "s") {
					e.preventDefault();
					handleSave();
				}
				return;
			}

			// Show shortcuts overlay (? key requires Shift on most keyboards)
			if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				setShowShortcuts(true);
				return;
			}

			// Ctrl+S - Save
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
				return;
			}

			// Ctrl+F - Focus search
			if ((e.ctrlKey || e.metaKey) && e.key === "f") {
				e.preventDefault();
				const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
				searchInput?.focus();
				return;
			}

			// Escape - Close shortcuts overlay
			if (e.key === "Escape" && showShortcuts) {
				setShowShortcuts(false);
				return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleSave, showShortcuts]);

	// Calculate totals
	const totalDuration = useMemo(() => timeline.reduce((sum, item) => sum + item.duration, 0), [timeline]);

	// Build details summary for collapsed view
	const detailsSummary = useMemo(() => {
		const parts: string[] = [];
		if (name) parts.push(name);
		if (!isEventMode && clubId) {
			const club = myClubs.find((c) => c.id === clubId);
			if (club) parts.push(club.name);
		}
		if (!isEventMode) parts.push(visibility);
		return parts.join(" · ");
	}, [name, clubId, visibility, myClubs, isEventMode]);

	// Add drill to timeline
	const handleAddDrill = useCallback((drill: Drill) => {
		const newItem: TimelineItem = {
			instanceId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			drill,
			duration: drill.duration || 10,
			notes: "",
			sectionId: undefined,
		};
		setTimeline((prev) => [...prev, newItem]);
	}, []);

	// View drill details
	const handleViewDetails = useCallback((drill: Drill) => {
		setSelectedDrill(drill);
	}, []);

	// Delete drill from session bar
	const handleDeleteDrill = useCallback((instanceId: string) => {
		setTimeline((prev) => prev.filter((item) => item.instanceId !== instanceId));
	}, []);

	// Change drill duration in session bar
	const handleDrillDurationChange = useCallback((instanceId: string, newDuration: number) => {
		setTimeline((prev) =>
			prev.map((item) =>
				item.instanceId === instanceId ? { ...item, duration: newDuration } : item
			)
		);
	}, []);

	// Reorder timeline items
	const handleTimelineReorder = useCallback((fromIndex: number, toIndex: number) => {
		setTimeline((prev) => {
			const newTimeline = [...prev];
			const [removed] = newTimeline.splice(fromIndex, 1);
			newTimeline.splice(toIndex, 0, removed);
			return newTimeline;
		});
	}, []);

	const isSaving = createMutation.isPending || updateMutation.isPending || createEventPlanMutation.isPending;

	// Format "saved X ago" text
	const formatSavedAgo = useCallback((timestamp: number) => {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 5) return "just now";
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ago`;
	}, []);

	// Update "saved ago" text periodically
	const [, forceUpdate] = useState(0);
	useEffect(() => {
		if (!lastSavedAt) return;
		const interval = setInterval(() => forceUpdate((n) => n + 1), 10000);
		return () => clearInterval(interval);
	}, [lastSavedAt]);

	// Show loading state while loading template or draft
	if ((isEditMode && isLoadingTemplate) || !draftLoaded) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-3">
				<Loader size="lg" />
				<p className="text-sm text-muted-foreground">
					{isEditMode ? "Loading plan..." : "Loading draft..."}
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-[1440px] mx-auto space-y-6 pb-24 lg:pb-12">
			{/* Skip Links for Accessibility */}
			<div className="sr-only focus-within:not-sr-only">
				<a
					href="#timeline"
					className="fixed top-4 left-4 z-[100] rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
				>
					Skip to timeline
				</a>
				<a
					href="#drill-library"
					className="fixed top-4 left-32 z-[100] rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
				>
					Skip to drill library
				</a>
				<a
					href="#save-button"
					className="fixed top-4 left-60 z-[100] rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
				>
					Skip to save
				</a>
			</div>

			{/* Header */}
			<div>
				<Link
					href={isEventMode && eventId ? `/hub/events/${eventId}/training` : "/hub/coaching/training/plans"}
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
					<ArrowLeft size={16} />
					{isEventMode ? "Back to Event" : "Back to Plans"}
				</Link>
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold text-foreground">
								{isEditMode ? "Edit Training Plan" : isEventMode ? "Create Event Plan" : "Create Training Plan"}
							</h1>
							{/* Draft indicator */}
							{lastSavedAt && (
								<div className="flex items-center gap-2">
									<div className={cn(
										"flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium",
										isEditMode && hasUnsavedChanges
											? "bg-warning/10 text-warning"
											: "bg-accent/10 text-accent"
									)}>
										<Cloud size={12} />
										<span>
											{isEditMode && hasUnsavedChanges
												? `Unsaved changes (${formatSavedAgo(lastSavedAt)})`
												: `Draft saved ${formatSavedAgo(lastSavedAt)}`
											}
										</span>
									</div>
									{!isEditMode && (
										<button
											type="button"
											onClick={() => {
												if (confirm("Clear draft and start fresh?")) {
													clearDraft();
													setName("");
													setDescription("");
													setClubId("");
													setVisibility("Private");
													setSessionDuration(90);
													setTimeline([]);
													setSections([]);
													setDetailsExpanded(true);
												}
											}}
											className="text-xs text-muted hover:text-foreground transition-colors"
										>
											Clear
										</button>
									)}
									{isEditMode && hasUnsavedChanges && (
										<button
											type="button"
											onClick={() => {
												if (confirm("Discard changes and reload from server?")) {
													clearDraft();
													setDraftLoaded(false); // Trigger reload
												}
											}}
											className="text-xs text-muted hover:text-foreground transition-colors"
										>
											Discard
										</button>
									)}
								</div>
							)}
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{isEventMode ? "Build a training plan for this event" : "Build a reusable training session template"}
						</p>
					</div>
					<div className="hidden lg:flex items-center gap-3">
						<Link href={isEventMode && eventId ? `/hub/events/${eventId}/training` : "/hub/coaching/training/plans"}>
							<Button variant="outline" color="neutral">
								Cancel
							</Button>
						</Link>
						<Button
							id="save-button"
							color="primary"
							leftIcon={<Save size={16} />}
							onClick={handleSave}
							disabled={!name.trim() || isSaving}
							aria-label={isEventMode ? "Save event training plan" : "Save training plan template"}
						>
							{isSaving ? "Saving..." : isEventMode ? "Save Plan" : "Save Template"}
						</Button>
					</div>
				</div>
			</div>

			{/* Template Details (Collapsible) */}
			<Card className="overflow-hidden">
				<button
					type="button"
					onClick={() => setDetailsExpanded(!detailsExpanded)}
					className="flex items-center justify-between w-full px-5 py-3 cursor-pointer hover:bg-hover/50 transition-colors">
					<div className="flex items-center gap-3">
						<h2 className="text-sm font-bold text-foreground">{isEventMode ? "Plan Details" : "Template Details"}</h2>
						{!detailsExpanded && detailsSummary && (
							<span className="text-xs text-muted-foreground">{detailsSummary}</span>
						)}
					</div>
					{detailsExpanded ? (
						<ChevronUp size={18} className="text-muted-foreground" />
					) : (
						<ChevronDown size={18} className="text-muted-foreground" />
					)}
				</button>

				{detailsExpanded && (
					<div className="px-5 pb-5 border-t border-border">
						<div className={cn(
							"grid grid-cols-1 gap-4 mt-4",
							isEventMode ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"
						)}>
							{/* Name */}
							<div>
								<label className="block text-xs font-medium text-muted-foreground mb-1.5">
									Name <span className="text-error">*</span>
								</label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g., Pre-Game Warm-up"
								/>
							</div>

							{/* Description */}
							<div>
								<label className="block text-xs font-medium text-muted-foreground mb-1.5">
									Description
								</label>
								<Input
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="What is this plan for?"
								/>
							</div>

							{/* Club - hidden in event mode */}
							{!isEventMode && (
								<div>
									<label className="block text-xs font-medium text-muted-foreground mb-1.5">
										Club <span className="text-muted-foreground/50">(optional)</span>
									</label>
									<select
										value={clubId}
										onChange={(e) => setClubId(e.target.value)}
										className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm outline-none cursor-pointer focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all">
										<option value="">Personal (no club)</option>
										{myClubs.map((club) => (
											<option key={club.id} value={club.id}>
												{club.name}
											</option>
										))}
									</select>
								</div>
							)}

							{/* Visibility - hidden in event mode */}
							{!isEventMode && (
								<div>
									<label className="block text-xs font-medium text-muted-foreground mb-1.5">
										Visibility
									</label>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => setVisibility("Private")}
											className={cn(
												"flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
												visibility === "Private"
													? "bg-accent/10 text-accent border border-accent/30"
													: "text-muted-foreground border border-border hover:border-border"
											)}>
											Private
										</button>
										<button
											type="button"
											onClick={() => setVisibility("Public")}
											className={cn(
												"flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
												visibility === "Public"
													? "bg-accent/10 text-accent border border-accent/30"
													: "text-muted-foreground border border-border hover:border-border"
											)}>
											Public
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</Card>

			{/* Session Overview Bar */}
			<SessionOverviewBar
				timeline={timeline}
				sections={sections}
				sessionDuration={sessionDuration}
				onSessionDurationChange={setSessionDuration}
				onViewDetails={handleViewDetails}
				onDeleteDrill={handleDeleteDrill}
				onDrillDurationChange={handleDrillDurationChange}
				onTimelineReorder={handleTimelineReorder}
			/>

			{/* Mobile Tab Switcher - only visible on small screens */}
			<div className="flex lg:hidden border-b border-border">
				<button
					onClick={() => setMobileTab("timeline")}
					className={cn(
						"flex-1 py-3 text-sm font-medium transition-colors",
						mobileTab === "timeline"
							? "text-accent border-b-2 border-accent"
							: "text-muted-foreground hover:text-foreground"
					)}>
					Timeline
				</button>
				<button
					onClick={() => setMobileTab("library")}
					className={cn(
						"flex-1 py-3 text-sm font-medium transition-colors",
						mobileTab === "library"
							? "text-accent border-b-2 border-accent"
							: "text-muted-foreground hover:text-foreground"
					)}>
					Library
				</button>
			</div>

			{/* Main Split Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* LEFT: Drill Library */}
				<div id="drill-library" className={cn("lg:col-span-4", mobileTab === "library" ? "block" : "hidden lg:block")}>
					<DrillLibraryPanel onAddDrill={handleAddDrill} onViewDetails={handleViewDetails} />
				</div>

				{/* RIGHT: Timeline Builder */}
				<div id="timeline" className={cn("lg:col-span-8", mobileTab === "timeline" ? "block" : "hidden lg:block")}>
					<TimelineBuilderPanel
						timeline={timeline}
						sections={sections}
						onTimelineChange={setTimeline}
						onSectionsChange={setSections}
						onViewDrillDetails={handleViewDetails}
						onAddDrill={handleAddDrill}
						sessionDuration={sessionDuration}
					/>
				</div>
			</div>

			{/* Drill Detail Modal */}
			<DrillDetailModal
				drill={selectedDrill}
				isOpen={!!selectedDrill}
				onClose={() => setSelectedDrill(null)}
				onAddToTimeline={handleAddDrill}
				showAddButton
			/>

			{/* Mobile Sticky Footer with Save Button */}
			<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-50">
				<div className="flex items-center gap-3">
					<Link
						href={isEventMode && eventId ? `/hub/events/${eventId}/training` : "/hub/coaching/training/plans"}
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						Cancel
					</Link>
					<Button
						color="primary"
						leftIcon={<Save size={16} />}
						onClick={handleSave}
						disabled={!name.trim() || isSaving}
						className="flex-1"
						aria-label={isEventMode ? "Save event training plan" : "Save training plan template"}
					>
						{isSaving ? "Saving..." : isEventMode ? "Save Plan" : "Save Template"}
					</Button>
				</div>
			</div>

			{/* Keyboard Shortcuts Overlay */}
			<KeyboardShortcutsOverlay isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
		</div>
	);
}

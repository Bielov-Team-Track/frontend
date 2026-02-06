"use client";

import { Badge, Button, Slider } from "@/components";
import type { Drill, DrillCategory, DrillIntensity, DrillSkill } from "@/lib/models/Drill";
import { cn } from "@/lib/utils";
import { Clock, Eye, Trash2, ChevronDown, ChevronUp, Minus, Plus, GripVertical } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

export interface TimelineItem {
	instanceId: string;
	drill: Drill;
	duration: number;
	notes: string;
	sectionId?: string;
}

export interface Section {
	id: string;
	name: string;
	color: string;
}

export interface SessionOverviewBarProps {
	timeline: TimelineItem[];
	sections: Section[];
	sessionDuration: number;
	onSessionDurationChange: (duration: number) => void;
	onViewDetails: (drill: Drill) => void;
	onDeleteDrill: (instanceId: string) => void;
	onDrillDurationChange?: (instanceId: string, newDuration: number) => void;
	onTimelineReorder?: (fromIndex: number, toIndex: number) => void;
}

type ViewMode = "categories" | "skills" | "intensity";

const SKILLS: DrillSkill[] = ["Serving", "Passing", "Setting", "Attacking", "Blocking", "Defense", "Conditioning", "Footwork"];
const CATEGORIES: DrillCategory[] = ["Warmup", "Technical", "Tactical", "Game", "Conditioning", "Cooldown"];
const INTENSITIES: DrillIntensity[] = ["Low", "Medium", "High"];

// Segment colors (for timeline bar)
const CATEGORY_COLORS: Record<DrillCategory, string> = {
	Warmup: "#29757A",
	Technical: "#2E5A88",
	Tactical: "#FF7D00",
	Game: "#D99100",
	Conditioning: "#BE3F23",
	Cooldown: "#4A7A45",
};

const INTENSITY_COLORS: Record<DrillIntensity, string> = {
	Low: "#4A7A45",
	Medium: "#D99100",
	High: "#BE3F23",
};

// Pill colors (brighter for better readability)
const CATEGORY_PILL_COLORS: Record<DrillCategory, string> = {
	Warmup: "#3DBCC4",
	Technical: "#5B9BD5",
	Tactical: "#FF9533",
	Game: "#FFBC33",
	Conditioning: "#E85A3D",
	Cooldown: "#6ABF62",
};

const INTENSITY_PILL_COLORS: Record<DrillIntensity, string> = {
	Low: "#6ABF62",
	Medium: "#FFBC33",
	High: "#E85A3D",
};

const SNAP_POINTS = [30, 60, 90, 120, 150, 180];
const SNAP_THRESHOLD = 4;

// =============================================================================
// SORTABLE SEGMENT COMPONENT
// =============================================================================

interface SortableSegmentProps {
	id: string;
	segment: {
		instanceId: string;
		leftPct: number;
		widthPct: number;
		color: string;
		isOverflow: boolean;
		name: string;
		intensity: DrillIntensity;
		category: DrillCategory;
		drill: Drill;
	};
	duration: number;
	viewMode: ViewMode;
	isResizing: boolean;
	onResizeStart: (e: React.MouseEvent, instanceId: string, duration: number) => void;
	onSegmentClick: (segment: SortableSegmentProps["segment"], duration: number, rect: DOMRect) => void;
}

const SortableSegment: React.FC<SortableSegmentProps> = ({
	id,
	segment,
	duration,
	viewMode,
	isResizing,
	onResizeStart,
	onSegmentClick,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		left: `${segment.leftPct}%`,
		width: `${segment.widthPct}%`,
		background: segment.color,
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : isResizing ? 40 : undefined,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"absolute top-[3px] bottom-[3px] rounded-[7px] transition-shadow group",
				"hover:brightness-110",
				segment.isOverflow && "opacity-45",
				isResizing && "ring-2 ring-accent",
				isDragging && "opacity-80 ring-2 ring-accent shadow-lg",
			)}
		>
			{/* Main draggable area - listeners only here, not on resize handle */}
			<div
				className={cn(
					"absolute inset-0 rounded-[7px] cursor-grab pr-3",
					isDragging && "cursor-grabbing",
				)}
				{...attributes}
				{...listeners}
				onClick={(e) => {
					if (isDragging) return;
					e.stopPropagation();
					const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
					if (parentRect) {
						onSegmentClick(segment, duration, parentRect);
					}
				}}
			>
				{/* Label */}
				{segment.widthPct > 8 && (
					<span className="absolute inset-0 flex items-center justify-center px-1 text-[9px] font-medium text-white/90 truncate drop-shadow-sm pointer-events-none">
						{viewMode === "intensity" ? segment.intensity : viewMode === "categories" ? segment.category : segment.name}
					</span>
				)}
			</div>

			{/* Resize handle on right edge - NO drag listeners here */}
			<div
				className={cn(
					"absolute top-0 bottom-0 right-0 w-3 cursor-ew-resize z-10",
					"opacity-0 group-hover:opacity-100 transition-opacity",
					"hover:bg-white/30 rounded-r-[7px]",
					isResizing && "opacity-100 bg-white/40",
				)}
				onMouseDown={(e) => {
					e.stopPropagation();
					e.preventDefault();
					onResizeStart(e, segment.instanceId, duration);
				}}
				onPointerDown={(e) => {
					e.stopPropagation();
				}}
				title="Drag to resize"
			>
				<div className="absolute top-1/2 right-0.5 -translate-y-1/2 w-0.5 h-4 bg-white/60 rounded-full" />
			</div>
		</div>
	);
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const SessionOverviewBar: React.FC<SessionOverviewBarProps> = ({
	timeline,
	sections,
	sessionDuration,
	onSessionDurationChange,
	onViewDetails,
	onDeleteDrill,
	onDrillDurationChange,
	onTimelineReorder,
}) => {
	const [viewMode, setViewMode] = React.useState<ViewMode>("categories");
	const [openPopover, setOpenPopover] = useState<{
		instanceId: string;
		drill: Drill;
		category: DrillCategory;
		color: string;
		segmentRect: { left: number; top: number; width: number };
		currentDuration: number;
	} | null>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const timelineBarRef = useRef<HTMLDivElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [resizing, setResizing] = useState<{
		instanceId: string;
		startX: number;
		startDuration: number;
	} | null>(null);

	// Close popover when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
				setOpenPopover(null);
			}
		};

		if (openPopover) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [openPopover]);

	// Calculate total duration from timeline
	const totalDuration = useMemo(() => {
		return timeline.reduce((sum, item) => sum + item.duration, 0);
	}, [timeline]);

	// Determine if over/under duration limit
	const isOverLimit = totalDuration > sessionDuration;
	const remainingTime = sessionDuration - totalDuration;

	// Get present categories, skills, and intensities
	const presentCategories = useMemo(() => new Set(timeline.map((t) => t.drill.category)), [timeline]);
	const presentSkills = useMemo(() => new Set(timeline.flatMap((t) => t.drill.skills)), [timeline]);
	const presentIntensities = useMemo(() => new Set(timeline.map((t) => t.drill.intensity)), [timeline]);

	// Calculate durations by category and intensity
	const categoryDurations = useMemo(() => {
		const durations: Record<string, number> = {};
		timeline.forEach((t) => {
			durations[t.drill.category] = (durations[t.drill.category] || 0) + t.duration;
		});
		return durations;
	}, [timeline]);

	const intensityDurations = useMemo(() => {
		const durations: Record<string, number> = {};
		timeline.forEach((t) => {
			durations[t.drill.intensity] = (durations[t.drill.intensity] || 0) + t.duration;
		});
		return durations;
	}, [timeline]);

	// Snap slider value to 30m increments
	const snapValue = (raw: number) => {
		for (const sp of SNAP_POINTS) {
			if (Math.abs(raw - sp) <= SNAP_THRESHOLD) return sp;
		}
		return raw;
	};

	// Handle slider change with snapping
	const handleSliderChange = (event: { target: { value: number | null } }) => {
		const value = event.target.value;
		if (value !== null) {
			const snapped = snapValue(value);
			onSessionDurationChange(snapped);
		}
	};

	// Calculate segment positions for timeline bar
	const segments = useMemo(() => {
		if (totalDuration === 0) return [];

		let offset = 0;
		return timeline.map((item) => {
			const widthPct = (item.duration / Math.max(totalDuration, sessionDuration)) * 100;
			const leftPct = (offset / Math.max(totalDuration, sessionDuration)) * 100;
			offset += item.duration;

			let color = "#666666";
			if (viewMode === "categories") {
				color = CATEGORY_COLORS[item.drill.category];
			} else if (viewMode === "intensity") {
				color = INTENSITY_COLORS[item.drill.intensity];
			} else if (viewMode === "skills") {
				// Orange gradient for skills view
				color = "#FF7D00";
			}

			return {
				instanceId: item.instanceId,
				leftPct,
				widthPct,
				color,
				isOverflow: offset > sessionDuration,
				name: item.drill.name,
				intensity: item.drill.intensity,
				category: item.drill.category,
				drill: item.drill,
			};
		});
	}, [timeline, totalDuration, sessionDuration, viewMode]);

	// Calculate time markers at 15-minute intervals
	const timeMarkers = useMemo(() => {
		const totalRef = Math.max(totalDuration, sessionDuration);
		const markers: Array<{ time: number; leftPct: number; isHighlighted: boolean }> = [];

		// Generate markers every 15 minutes up to the total reference
		for (let time = 15; time <= totalRef; time += 15) {
			markers.push({
				time,
				leftPct: (time / totalRef) * 100,
				isHighlighted: time % 30 === 0, // Highlight 30-minute marks more
			});
		}

		return markers;
	}, [totalDuration, sessionDuration]);

	// Calculate section spans positions
	const sectionSpans = useMemo(() => {
		if (sections.length === 0 || totalDuration === 0) return [];

		const spans: Array<{ section: Section; leftPct: number; widthPct: number }> = [];
		const totalRef = Math.max(totalDuration, sessionDuration);

		let offset = 0;
		const timelineWithSections = timeline.map((item) => {
			const start = offset;
			const end = offset + item.duration;
			offset = end;
			return { ...item, start, end };
		});

		sections.forEach((section) => {
			const sectionItems = timelineWithSections.filter((item) => item.sectionId === section.id);
			if (sectionItems.length === 0) return;

			const startTime = sectionItems[0].start;
			const endTime = sectionItems[sectionItems.length - 1].end;
			const duration = endTime - startTime;

			spans.push({
				section,
				leftPct: (startTime / totalRef) * 100,
				widthPct: (duration / totalRef) * 100,
			});
		});

		return spans;
	}, [sections, timeline, totalDuration, sessionDuration]);

	// Quick duration preset handler
	const handlePresetClick = (minutes: number) => {
		onSessionDurationChange(minutes);
	};

	// Resize handlers for dragging segment edges
	const handleResizeStart = (e: React.MouseEvent, instanceId: string, currentDuration: number) => {
		e.preventDefault();
		e.stopPropagation();
		setResizing({
			instanceId,
			startX: e.clientX,
			startDuration: currentDuration,
		});
	};

	useEffect(() => {
		if (!resizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			if (!timelineBarRef.current || !resizing) return;

			const barRect = timelineBarRef.current.getBoundingClientRect();
			const barWidth = barRect.width;
			const totalRef = Math.max(totalDuration, sessionDuration);

			// Calculate pixels per minute
			const pixelsPerMinute = barWidth / totalRef;

			// Calculate delta in pixels and convert to minutes
			const deltaX = e.clientX - resizing.startX;
			const deltaMinutes = Math.round(deltaX / pixelsPerMinute);

			// Calculate new duration (min 5 minutes, max 180 minutes)
			const newDuration = Math.max(5, Math.min(180, resizing.startDuration + deltaMinutes));

			// Update the drill duration
			onDrillDurationChange?.(resizing.instanceId, newDuration);
		};

		const handleMouseUp = () => {
			setResizing(null);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [resizing, totalDuration, sessionDuration, onDrillDurationChange]);

	// DnD Kit sensors for drag-to-reorder
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // 8px movement before drag starts
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = timeline.findIndex((item) => item.instanceId === active.id);
			const newIndex = timeline.findIndex((item) => item.instanceId === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				onTimelineReorder?.(oldIndex, newIndex);
			}
		}
	};

	return (
		<div className="rounded-2xl bg-surface backdrop-blur-sm shadow-sm p-5 space-y-4">
			{/* Mobile Collapsed View */}
			<div className="lg:hidden">
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="w-full flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Session</h2>
						<span className="text-sm font-bold text-foreground">
							{totalDuration} / {sessionDuration}m
						</span>
					</div>
					<button type="button" className="text-muted-foreground">
						{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
					</button>
				</button>
				<div className="mt-2 h-2 bg-subtle rounded-full overflow-hidden">
					<div
						className={cn("h-full rounded-full transition-all", isOverLimit ? "bg-error" : "bg-gradient-to-r from-[#29757A] via-[#2E5A88] to-[#FF7D00]")}
						style={{ width: `${Math.min((totalDuration / sessionDuration) * 100, 100)}%` }}
					/>
				</div>
				{!isExpanded && (
					<div className="text-[10px] text-muted-foreground mt-1">
						{isOverLimit ? `${Math.abs(remainingTime)}m over` : `${remainingTime}m remaining`}
					</div>
				)}
			</div>

			{/* Desktop Full View - always visible on desktop, conditionally visible on mobile */}
			<div className={cn("space-y-4", isExpanded ? "block" : "hidden lg:block")}>
				{/* Header Row */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h2 className="text-sm font-bold text-foreground tracking-wider hidden lg:block">Session Overview</h2>
						{/* View Switcher */}
						<div className="hidden lg:flex items-center bg-subtle/50 rounded-lg p-0.5 border border-border">
						<Button
							variant={viewMode === "categories" ? "default" : "ghost"}
							className={cn(
								"text-[10px] font-medium transition-all rounded-md",
								viewMode === "categories" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground",
							)}
							onClick={() => setViewMode("categories")}>
							Categories
						</Button>
						<Button
							variant={viewMode === "skills" ? "default" : "ghost"}
							className={cn(
								"text-[10px] font-medium transition-all rounded-md",
								viewMode === "skills" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground",
							)}
							onClick={() => setViewMode("skills")}>
							Skills
						</Button>
						<Button
							variant={viewMode === "intensity" ? "default" : "ghost"}
							className={cn(
								"text-[10px] font-medium transition-all rounded-md",
								viewMode === "intensity" ? "bg-primary/15 text-primary" : "text-muted hover:text-foreground",
							)}
							onClick={() => setViewMode("intensity")}>
							Intensity
						</Button>
					</div>
				</div>
					<div className="flex items-center gap-4">
						<div className="text-right hidden lg:block">
							<span className="text-xl font-bold text-foreground">{totalDuration}</span>
							<span className="text-sm text-muted font-medium"> / {sessionDuration}m</span>
							<div className={cn("text-xs font-bold", isOverLimit ? "text-error" : "text-green-500")}>
								{isOverLimit ? `${Math.abs(remainingTime)}m over` : `${remainingTime}m remaining`}
							</div>
						</div>
					</div>
				</div>

				{/* Pills Row */}
				<div className="min-h-8 hidden lg:block">
				{viewMode === "categories" && (
					<div className="flex flex-wrap items-center gap-2">
						{CATEGORIES.map((category) => {
							const isActive = presentCategories.has(category);
							const duration = categoryDurations[category] || 0;
							return (
								<Badge
									key={category}
									variant={isActive ? "soft" : "ghost"}
									size="md"
									className={cn(
										"text-xs font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1",
										isActive ? `border` : "text-muted/50 border border-border/40",
									)}
									style={
										isActive
											? {
													background: `${CATEGORY_PILL_COLORS[category]}25`,
													borderColor: `${CATEGORY_PILL_COLORS[category]}60`,
													color: CATEGORY_PILL_COLORS[category],
												}
											: undefined
									}>
									<span
										className="w-2 h-2 rounded-full flex-shrink-0"
										style={{ background: isActive ? CATEGORY_PILL_COLORS[category] : "#666666" }}
									/>
									{category}
									{isActive ? ` · ${duration}m` : ""}
								</Badge>
							);
						})}
					</div>
				)}

				{viewMode === "skills" && (
					<div className="flex flex-wrap items-center gap-2">
						{SKILLS.map((skill) => {
							const isActive = presentSkills.has(skill);
							return (
								<Badge
									key={skill}
									variant={isActive ? "soft" : "ghost"}
									color={isActive ? "primary" : "neutral"}
									size="md"
									className={cn("text-xs font-semibold transition-all px-2.5 py-1", isActive ? "" : "text-muted/50 border border-border/40")}>
									{skill}
								</Badge>
							);
						})}
						<span className="text-[10px] text-muted ml-2">
							{presentSkills.size}/{SKILLS.length} covered
						</span>
					</div>
				)}

				{viewMode === "intensity" && (
					<div className="flex items-center gap-2">
						{INTENSITIES.map((intensity) => {
							const isActive = presentIntensities.has(intensity);
							const duration = intensityDurations[intensity] || 0;
							return (
								<Badge
									key={intensity}
									variant={isActive ? "soft" : "ghost"}
									size="md"
									className={cn("text-xs font-semibold transition-all flex items-center gap-1.5 px-2.5 py-1", isActive ? "border" : "text-muted/50 border border-border/40")}
									style={
										isActive
											? {
													background: `${INTENSITY_PILL_COLORS[intensity]}25`,
													borderColor: `${INTENSITY_PILL_COLORS[intensity]}60`,
													color: INTENSITY_PILL_COLORS[intensity],
												}
											: undefined
									}>
									<span
										className="w-2 h-2 rounded-full flex-shrink-0"
										style={{ background: isActive ? INTENSITY_PILL_COLORS[intensity] : "#666666" }}
									/>
									{intensity}
									{isActive ? ` · ${duration}m` : ""}
								</Badge>
							);
						})}
					</div>
				)}
				</div>

				{/* Horizontal Timeline Bar */}
				<div className="relative hidden lg:block">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<div ref={timelineBarRef} className={cn("relative h-10 bg-subtle rounded-[10px] overflow-visible", resizing && "select-none")}>
						{/* Time interval markers */}
						{timeMarkers.map((marker) => (
							<div
								key={marker.time}
								className={cn("absolute top-0 bottom-0 w-px", marker.isHighlighted ? "bg-border" : "bg-border/50")}
								style={{ left: `${marker.leftPct}%` }}
							/>
						))}

						<div className="relative h-full rounded-[10px] overflow-hidden">
							{timeline.length === 0 ? (
								<div className="absolute inset-0 flex items-center justify-center text-xs text-muted/30">Add drills to visualize your session</div>
							) : (
								<SortableContext
									items={timeline.map((t) => t.instanceId)}
									strategy={horizontalListSortingStrategy}
								>
									{segments.map((seg) => {
										const timelineItem = timeline.find(t => t.instanceId === seg.instanceId);
										const itemDuration = timelineItem?.duration || seg.drill.duration || 10;
										const isResizingThis = resizing?.instanceId === seg.instanceId;

										return (
											<SortableSegment
												key={seg.instanceId}
												id={seg.instanceId}
												segment={seg}
												duration={itemDuration}
												viewMode={viewMode}
												isResizing={isResizingThis}
												onResizeStart={handleResizeStart}
												onSegmentClick={(segment, duration, rect) => {
													setOpenPopover({
														instanceId: segment.instanceId,
														drill: segment.drill,
														category: segment.category,
														color: segment.color,
														segmentRect: {
															left: rect.left,
															top: rect.top,
															width: rect.width,
														},
														currentDuration: duration,
													});
												}}
											/>
										);
									})}
								</SortableContext>
							)}
						</div>
						{/* End marker - outside overflow-hidden so labels are visible */}
						<div
							className={cn(
								"absolute top-[-4px] bottom-[-4px] w-0.5 z-20 rounded-[1px] pointer-events-none",
								isOverLimit ? "bg-error" : "bg-accent"
							)}
							style={{ left: `${(sessionDuration / Math.max(totalDuration, sessionDuration)) * 100}%` }}>
							<span className={cn(
								"absolute top-[-10px] left-1/2 -translate-x-1/2 text-[8px] font-bold tracking-wider whitespace-nowrap",
								isOverLimit ? "text-error" : "text-accent"
							)}>
								END
							</span>
							<span className={cn(
								"absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-[8px] font-medium tracking-wider whitespace-nowrap px-1 bg-surface rounded",
								isOverLimit ? "text-error" : "text-muted"
							)}>
								{sessionDuration}m
							</span>
						</div>
					</div>
				</DndContext>

				{/* Time labels below bar */}
				<div className="relative h-4 mt-1">
					{timeMarkers.map((marker) => (
						<span
							key={marker.time}
							className={cn("absolute -translate-x-1/2 text-[9px] font-mono", marker.isHighlighted ? "text-muted" : "text-muted/50")}
							style={{ left: `${marker.leftPct}%` }}>
							{marker.time}m
						</span>
					))}
					</div>
				</div>

				{/* Section Spans Below Bar */}
				{sections.length > 0 && (
					<div className="relative h-5 hidden lg:block">
					{sectionSpans.map((span) => (
						<div
							key={span.section.id}
							className="absolute top-0 h-full flex items-center overflow-hidden rounded-[4px]"
							style={{
								left: `${span.leftPct}%`,
								width: `${span.widthPct}%`,
								background: `${span.section.color}20`,
								borderLeft: `2px solid ${span.section.color}`,
							}}>
							<span
								className="text-[9px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis px-1 tracking-wide uppercase"
								style={{ color: span.section.color }}>
								{span.section.name}
							</span>
						</div>
						))}
					</div>
				)}

				{/* Duration Slider with Quick Presets */}
				<div className="hidden lg:block">
				{/* Quick Duration Preset Buttons */}
				<div className="flex items-center gap-2 mb-3">
					<span className="text-xs text-muted">Quick preset:</span>
					<div className="flex gap-1">
						{SNAP_POINTS.map((minutes) => (
							<button
								key={minutes}
								onClick={() => handlePresetClick(minutes)}
								className={cn(
									"px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
									sessionDuration === minutes
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-muted hover:border-primary/50 hover:text-foreground"
								)}
							>
								{minutes}m
							</button>
						))}
					</div>
				</div>

				<Slider
					label="Target Duration"
					min={10}
					max={180}
					step={1}
					value={sessionDuration}
					onValueChange={(value) => {
						if (value !== null) {
							const snapped = snapValue(value);
							onSessionDurationChange(snapped);
						}
					}}
					formatValue={(val) => `${val}m`}
					showValue
					className="w-full"
				/>
				<div className="relative h-4 mt-1.5">
					{SNAP_POINTS.map((point) => {
						// Calculate percentage position based on slider range (10-180)
						const pct = ((point - 10) / (180 - 10)) * 100;
						return (
							<span
								key={point}
								className="absolute text-[9px] text-muted/50 font-mono -translate-x-1/2"
								style={{ left: `${pct}%` }}
							>
								{point}
							</span>
						);
					})}
				</div>
				</div>
			</div>

			{/* Segment Popover */}
			{openPopover && (() => {
				const popoverWidth = 256; // w-64 = 16rem = 256px
				const centerX = openPopover.segmentRect.left + openPopover.segmentRect.width / 2;
				// Clamp horizontal position to keep popover within viewport
				const clampedX = Math.max(popoverWidth / 2 + 8, Math.min(window.innerWidth - popoverWidth / 2 - 8, centerX));

				return (
					<div
						ref={popoverRef}
						className="fixed z-50 w-64 rounded-xl border border-border bg-raised/95 p-3 shadow-lg backdrop-blur-lg"
						style={{
							left: clampedX,
							top: openPopover.segmentRect.top - 8,
							transform: "translate(-50%, -100%)",
						}}
					>
					<div className="space-y-3">
						<div>
							<h4 className="font-semibold text-sm text-foreground truncate">{openPopover.drill.name}</h4>
							<div className="flex items-center gap-2 mt-1 text-xs text-muted">
								<span style={{ color: openPopover.color }}>{openPopover.category}</span>
								<span className="text-muted/50">•</span>
								<span>{openPopover.drill.intensity}</span>
							</div>
						</div>

						{/* Duration Adjustment */}
						<div className="flex items-center justify-between bg-subtle/50 rounded-lg p-2">
							<span className="text-xs text-muted-foreground">Duration</span>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => {
										const newDuration = Math.max(5, openPopover.currentDuration - 5);
										setOpenPopover({ ...openPopover, currentDuration: newDuration });
										onDrillDurationChange?.(openPopover.instanceId, newDuration);
									}}
									className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-hover transition-colors"
									aria-label="Decrease duration"
								>
									<Minus size={14} />
								</button>
								<span className="text-sm font-bold text-foreground min-w-[40px] text-center">
									{openPopover.currentDuration}m
								</span>
								<button
									type="button"
									onClick={() => {
										const newDuration = Math.min(180, openPopover.currentDuration + 5);
										setOpenPopover({ ...openPopover, currentDuration: newDuration });
										onDrillDurationChange?.(openPopover.instanceId, newDuration);
									}}
									className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-hover transition-colors"
									aria-label="Increase duration"
								>
									<Plus size={14} />
								</button>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant="outline"
								color="neutral"
								className="flex-1"
								leftIcon={<Eye size={14} />}
								onClick={() => {
									const drill = openPopover.drill;
									setOpenPopover(null);
									onViewDetails(drill);
								}}
							>
								Details
							</Button>
							<Button
								size="sm"
								variant="outline"
								color="error"
								leftIcon={<Trash2 size={14} />}
								onClick={() => {
									const instanceId = openPopover.instanceId;
									setOpenPopover(null);
									onDeleteDrill(instanceId);
								}}
							>
								Remove
							</Button>
						</div>
					</div>
				</div>
				);
			})()}
		</div>
	);
};

export default SessionOverviewBar;

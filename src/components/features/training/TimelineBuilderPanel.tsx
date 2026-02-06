"use client";

import React, { useState, useRef, useEffect } from "react";
import { Drill, DrillCategory, DrillIntensity } from "@/lib/models/Drill";
import { Button, Badge, Input, TextArea, Card } from "@/components";
import {
  Clock,
  Plus,
  Trash2,
  Eye,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Download,
  X,
  LayoutList,
  StickyNote,
} from "lucide-react";

// Types
interface TimelineItem {
  instanceId: string;
  drill: Drill;
  duration: number;
  notes: string;
  sectionId?: string;
}

interface Section {
  id: string;
  name: string;
  color: string;
}

interface TimelineBuilderPanelProps {
  timeline: TimelineItem[];
  sections: Section[];
  onTimelineChange: (timeline: TimelineItem[]) => void;
  onSectionsChange: (sections: Section[]) => void;
  onViewDrillDetails: (drill: Drill) => void;
}

// Constants
const SECTION_COLORS = [
  "#FF7D00",
  "#29757A",
  "#2E5A88",
  "#D99100",
  "#4A7A45",
  "#BE3F23",
];

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

// Duration Editor Popover Component
interface DurationEditorProps {
  instanceId: string;
  duration: number;
  notes: string;
  position: { x: number; y: number };
  onSave: (duration: number, notes: string) => void;
  onCancel: () => void;
}

const DurationEditor: React.FC<DurationEditorProps> = ({
  duration,
  notes,
  position,
  onSave,
  onCancel,
}) => {
  const [localDuration, setLocalDuration] = useState(duration);
  const [localNotes, setLocalNotes] = useState(notes);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  const handleAdjust = (delta: number) => {
    setLocalDuration((prev) => Math.max(1, prev + delta));
  };

  const handleSave = () => {
    onSave(localDuration, localNotes);
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 min-w-[240px] rounded-xl border border-border/80 bg-raised/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
      style={{ left: position.x, top: position.y }}
    >
      {/* Arrow pointer */}
      <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-l border-t border-border/80 bg-raised/95" />

      <label className="mb-2 block text-xs font-semibold text-foreground">
        Duration (minutes)
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAdjust(-5)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-subtle text-foreground hover:bg-hover hover:border-border-strong transition-all text-sm font-medium"
        >
          -5
        </button>
        <Input
          type="number"
          value={localDuration}
          onChange={(e) => setLocalDuration(Math.max(1, parseInt(e.target.value) || 1))}
          className="flex-1 text-center font-semibold tabular-nums"
          min={1}
        />
        <button
          onClick={() => handleAdjust(5)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-subtle text-foreground hover:bg-hover hover:border-border-strong transition-all text-sm font-medium"
        >
          +5
        </button>
      </div>
      <label className="mb-1.5 mt-4 block text-xs font-semibold text-foreground">Notes</label>
      <TextArea
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        placeholder="Optional coach notes..."
        rows={2}
        className="resize-none"
      />
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} className="flex-1">
          Save
        </Button>
      </div>
    </div>
  );
};

// Drop Zone Placeholder Component
interface DropZonePlaceholderProps {
  onDrop: () => void;
}

const DropZonePlaceholder: React.FC<DropZonePlaceholderProps> = ({ onDrop }) => {
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={onDrop}
      className="mb-3 flex items-center justify-center rounded-xl border-2 border-dashed border-accent/60 bg-accent/5 p-4 text-center text-sm transition-all duration-200 hover:border-accent hover:bg-accent/10 relative overflow-hidden"
    >
      {/* Animated shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent -translate-x-full animate-[shimmer_2s_linear_infinite]" />

      <span className="flex items-center gap-2 font-medium text-accent relative z-10">
        <ChevronDown size={16} className="animate-bounce" />
        Drop here
        <ChevronDown size={16} className="animate-bounce [animation-delay:150ms]" />
      </span>
    </div>
  );
};

// Drill Item Card Component
interface DrillItemCardProps {
  item: TimelineItem;
  index: number;
  totalItems: number;
  isDragging: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onViewDetails: () => void;
  onDurationClick: (event: React.MouseEvent) => void;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: (event: React.DragEvent) => void;
}

const DrillItemCard: React.FC<DrillItemCardProps> = ({
  item,
  index,
  totalItems,
  isDragging,
  onMoveUp,
  onMoveDown,
  onRemove,
  onViewDetails,
  onDurationClick,
  onDragStart,
  onDragEnd,
}) => {
  const categoryColor = CATEGORY_COLORS[item.drill.category];
  const intensityColor = INTENSITY_COLORS[item.drill.intensity];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      tabIndex={0}
      role="listitem"
      aria-label={`${item.drill.name}, ${item.duration} minutes, position ${index + 1} of ${totalItems}`}
      className={`group relative mb-3 flex cursor-move items-start gap-3.5 rounded-xl p-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        isDragging
          ? "opacity-50 scale-[0.98] border-2 border-dashed border-accent bg-accent/10 shadow-lg"
          : "border border-border/50 bg-surface/80 shadow-sm hover:border-accent/30 hover:bg-surface hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Category color bar with glow */}
      <div
        className="h-full w-1.5 flex-shrink-0 rounded-full"
        style={{
          background: categoryColor,
          boxShadow: `0 0 8px ${categoryColor}40`
        }}
      />

      {/* Drag handle */}
      <div className={`flex-shrink-0 pt-1 transition-colors duration-200 ${
        isDragging ? "text-accent" : "text-muted/40 group-hover:text-muted"
      }`}>
        <GripVertical size={16} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 py-0.5 relative z-10">
        <h4 className="text-sm font-semibold text-foreground leading-tight truncate">
          {item.drill.name}
        </h4>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {/* Duration - clickable with better styling */}
          <button
            onClick={onDurationClick}
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors rounded-md px-1.5 py-0.5 -ml-1.5 hover:bg-accent/10"
          >
            <Clock size={13} strokeWidth={2.5} />
            <span className="tabular-nums">{item.duration}m</span>
          </button>

          {/* Category badge - no border */}
          <Badge
            variant="custom"
            className="text-[10px] px-1.5 py-0.5"
            style={{
              background: `${categoryColor}15`,
              color: categoryColor,
            }}
          >
            {item.drill.category}
          </Badge>

          {/* Intensity badge - with border */}
          <Badge
            variant="custom"
            className="text-[10px] px-1.5 py-0.5"
            style={{
              background: `${intensityColor}15`,
              color: intensityColor,
              borderColor: `${intensityColor}30`,
              borderWidth: '1px',
            }}
          >
            {item.drill.intensity}
          </Badge>
        </div>

        {/* Notes preview with icon */}
        {item.notes && (
          <div className="mt-2 flex items-start gap-1.5 text-xs">
            <StickyNote size={11} className="text-muted/50 mt-0.5 flex-shrink-0" />
            <p className="text-muted/70 line-clamp-2 leading-relaxed">
              {item.notes}
            </p>
          </div>
        )}
      </div>

      {/* Hover actions with staggered animation */}
      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100 focus-within:opacity-100 relative z-10">
        {index > 0 && (
          <button
            onClick={onMoveUp}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-border-strong hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Move drill up"
          >
            <ChevronUp size={14} />
          </button>
        )}
        {index < totalItems - 1 && (
          <button
            onClick={onMoveDown}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-border-strong hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Move drill down"
          >
            <ChevronDown size={14} />
          </button>
        )}
        <button
          onClick={onViewDetails}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-border-strong hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="View drill details"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-error/30 hover:text-error hover:scale-110 hover:rotate-12 active:scale-95 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="Remove drill from timeline"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// Main Component
interface TimelineBuilderPanelPropsExtended extends TimelineBuilderPanelProps {
  sessionDuration?: number;
}

export const TimelineBuilderPanel: React.FC<TimelineBuilderPanelPropsExtended> = ({
  timeline,
  sections,
  onTimelineChange,
  onSectionsChange,
  onViewDrillDetails,
  sessionDuration = 90,
}) => {
  const [editingDuration, setEditingDuration] = useState<{
    instanceId: string;
    duration: number;
    notes: string;
    position: { x: number; y: number };
  } | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Calculate total timeline duration
  const totalDuration = timeline.reduce((sum, item) => sum + item.duration, 0);
  const progressPercent = Math.min((totalDuration / sessionDuration) * 100, 100);
  const isOvertime = totalDuration > sessionDuration;

  // Toggle section collapse
  const toggleSectionCollapse = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  // Add section
  const handleAddSection = () => {
    const colorIdx = sections.length % SECTION_COLORS.length;
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      color: SECTION_COLORS[colorIdx],
    };
    onSectionsChange([...sections, newSection]);
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    // Move items to ungrouped
    const updatedTimeline = timeline.map((item) =>
      item.sectionId === sectionId ? { ...item, sectionId: undefined } : item
    );
    onTimelineChange(updatedTimeline);
    onSectionsChange(sections.filter((s) => s.id !== sectionId));
  };

  // Edit section name
  const handleSectionNameChange = (sectionId: string, newName: string) => {
    onSectionsChange(
      sections.map((s) => (s.id === sectionId ? { ...s, name: newName } : s))
    );
  };

  // Clear all
  const handleClearAll = () => {
    onTimelineChange([]);
    onSectionsChange([]);
  };

  // Remove drill
  const handleRemoveDrill = (instanceId: string) => {
    onTimelineChange(timeline.filter((item) => item.instanceId !== instanceId));
  };

  // Move drill
  const handleMoveDrill = (instanceId: string, direction: number) => {
    const index = timeline.findIndex((item) => item.instanceId === instanceId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= timeline.length) return;

    const newTimeline = [...timeline];
    const [movedItem] = newTimeline.splice(index, 1);
    newTimeline.splice(newIndex, 0, movedItem);

    // Adopt section of neighbor
    const neighbor = newTimeline[newIndex + (direction > 0 ? -1 : 1)];
    if (neighbor && neighbor.sectionId !== movedItem.sectionId) {
      movedItem.sectionId = neighbor.sectionId;
    }

    onTimelineChange(newTimeline);
  };

  // Duration editor
  const handleDurationClick = (
    instanceId: string,
    duration: number,
    notes: string,
    event: React.MouseEvent
  ) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setEditingDuration({
      instanceId,
      duration,
      notes,
      position: { x: rect.left, y: rect.bottom + 8 },
    });
  };

  const handleSaveDuration = (duration: number, notes: string) => {
    if (!editingDuration) return;

    onTimelineChange(
      timeline.map((item) =>
        item.instanceId === editingDuration.instanceId
          ? { ...item, duration, notes }
          : item
      )
    );
    setEditingDuration(null);
  };

  // Drag and drop
  const handleDragStart = (instanceId: string) => {
    setDraggedItemId(instanceId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (targetIndex: number, sectionId?: string) => {
    if (!draggedItemId) return;

    const draggedIndex = timeline.findIndex(
      (item) => item.instanceId === draggedItemId
    );
    if (draggedIndex === -1) return;

    const newTimeline = [...timeline];
    const [draggedItem] = newTimeline.splice(draggedIndex, 1);
    draggedItem.sectionId = sectionId;
    newTimeline.splice(targetIndex, 0, draggedItem);

    onTimelineChange(newTimeline);
    setDraggedItemId(null);
  };

  // Build ordered timeline structure
  const buildOrderedTimeline = () => {
    const result: Array<{
      type: "section" | "ungrouped";
      section?: Section;
      items: TimelineItem[];
    }> = [];

    // Sections with their items
    sections.forEach((section) => {
      const items = timeline.filter((item) => item.sectionId === section.id);
      result.push({ type: "section", section, items });
    });

    // Ungrouped items
    const ungrouped = timeline.filter(
      (item) =>
        !item.sectionId || !sections.find((s) => s.id === item.sectionId)
    );
    if (ungrouped.length > 0) {
      result.push({ type: "ungrouped", items: ungrouped });
    }

    return result;
  };

  const orderedTimeline = buildOrderedTimeline();

  return (
    <div className="space-y-4">
      {/* Section actions row */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSection}
          className="border-dashed hover:border-primary/50 hover:text-primary"
        >
          <Plus size={12} />
          Add Section
        </Button>
        {(timeline.length > 0 || sections.length > 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="hover:border-error/30 hover:text-error"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Session Progress Bar */}
      {timeline.length > 0 && (
        <div className="relative">
          <div className="h-2 rounded-full bg-subtle overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out relative ${
                isOvertime
                  ? "bg-gradient-to-r from-warning/80 to-warning"
                  : "bg-gradient-to-r from-accent/80 to-accent"
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_linear_infinite]" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="font-medium text-muted">
              Session Progress
            </span>
            <span className={`font-semibold tabular-nums ${
              isOvertime ? "text-warning" : "text-accent"
            }`}>
              {totalDuration}m / {sessionDuration}m
              {isOvertime && " (overtime)"}
            </span>
          </div>
        </div>
      )}

      {/* Timeline Area */}
      <div className="min-h-[400px]">
        {timeline.length === 0 && sections.length === 0 ? (
          // Empty State
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-subtle">
              <Clock size={28} className="text-muted" strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 text-lg font-bold text-foreground">
              Build your training timeline
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-sm text-muted">
              Drag drills from the library or click + to add them to your
              session
            </p>
            <Button variant="outline" className="mx-auto">
              <Download size={16} />
              Load Template
            </Button>
          </Card>
        ) : (
          // Timeline Content
          <div className="relative pl-8" role="list" aria-label="Training drills timeline">
            {/* Timeline line with gradient */}
            <div className="absolute bottom-2 left-3 top-2 w-1 bg-gradient-to-b from-accent via-border to-border/20 rounded-full" />

            {/* Start dot with glow effect */}
            <div className="absolute left-[3px] top-0 z-10 h-5 w-5 rounded-full border-4 border-base bg-accent shadow-lg">
              <div className="absolute inset-0 rounded-full bg-accent/30 blur-sm -z-10" />
            </div>

            {/* Ordered sections and items */}
            {orderedTimeline.map((group, groupIndex) => (
              <div key={groupIndex}>
                {group.type === "section" && group.section && (
                  <div className="relative mb-2 mt-4 first:mt-0">
                    {/* Section dot with glow */}
                    <div
                      className="absolute left-[-25px] top-1/2 z-10 h-[13px] w-[13px] -translate-y-1/2 rounded-full border-[3px] border-base"
                      style={{
                        background: group.section.color,
                        boxShadow: `0 0 12px ${group.section.color}60`
                      }}
                    />

                    {/* Section header with enhanced styling */}
                    <div
                      className="ml-2 flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:scale-[1.005]"
                      style={{
                        background: `linear-gradient(135deg, ${group.section.color}08 0%, ${group.section.color}15 100%)`,
                        border: `1.5px solid ${group.section.color}40`,
                        boxShadow: `0 2px 8px ${group.section.color}10`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Collapse toggle */}
                        <button
                          onClick={() => toggleSectionCollapse(group.section!.id)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          aria-label={collapsedSections.has(group.section.id) ? "Expand section" : "Collapse section"}
                        >
                          {collapsedSections.has(group.section.id) ? (
                            <ChevronRight size={14} style={{ color: group.section.color }} />
                          ) : (
                            <ChevronDown size={14} style={{ color: group.section.color }} />
                          )}
                        </button>

                        {/* Section dot indicator */}
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            background: group.section.color,
                            boxShadow: `0 0 8px ${group.section.color}60`
                          }}
                        />

                        {/* Editable section name */}
                        <input
                          type="text"
                          value={group.section.name}
                          onChange={(e) =>
                            handleSectionNameChange(
                              group.section!.id,
                              e.target.value
                            )
                          }
                          className="cursor-text rounded-md bg-transparent px-2 py-1 text-xs font-bold uppercase tracking-wider outline-none transition-all hover:bg-white/10 focus:bg-white/15 focus:ring-2 focus:ring-white/30"
                          style={{ color: group.section.color }}
                        />

                        {/* Enhanced metrics */}
                        <div className="flex items-center gap-2 text-[10px] font-medium">
                          <span className="flex items-center gap-1 text-muted">
                            <LayoutList size={11} />
                            {group.items.length}
                          </span>
                          <span className="text-muted/50">·</span>
                          <span
                            className="flex items-center gap-1 tabular-nums"
                            style={{ color: group.section.color }}
                          >
                            <Clock size={11} />
                            {group.items.reduce((sum, item) => sum + item.duration, 0)}m
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSection(group.section!.id)}
                        className="rounded-lg p-1.5 text-muted/50 transition-all hover:bg-error/10 hover:text-error hover:scale-110"
                        title="Delete section"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Section items - conditionally rendered based on collapse state */}
                    {!collapsedSections.has(group.section.id) && (
                      <div className="ml-2 mt-2">
                        {/* Drop zone at the start of section */}
                        {draggedItemId && group.items.length === 0 && (
                          <DropZonePlaceholder
                            onDrop={() => {
                              const firstItemIndex = timeline.findIndex(
                                (item) => item.sectionId === group.section!.id
                              );
                              if (firstItemIndex !== -1) {
                                handleDrop(firstItemIndex, group.section!.id);
                              } else {
                                // Empty section - add at the end
                                handleDrop(timeline.length, group.section!.id);
                              }
                            }}
                          />
                        )}

                        {group.items.map((item, itemIndex) => {
                          const globalIndex = timeline.indexOf(item);
                          return (
                            <React.Fragment key={item.instanceId}>
                              {/* Drop zone before this item */}
                              {draggedItemId && draggedItemId !== item.instanceId && itemIndex === 0 && (
                                <DropZonePlaceholder
                                  onDrop={() => handleDrop(globalIndex, group.section!.id)}
                                />
                              )}

                              <DrillItemCard
                                item={item}
                                index={globalIndex}
                                totalItems={timeline.length}
                                isDragging={draggedItemId === item.instanceId}
                                onMoveUp={() =>
                                  handleMoveDrill(item.instanceId, -1)
                                }
                                onMoveDown={() =>
                                  handleMoveDrill(item.instanceId, 1)
                                }
                                onRemove={() => handleRemoveDrill(item.instanceId)}
                                onViewDetails={() => onViewDrillDetails(item.drill)}
                                onDurationClick={(e) =>
                                  handleDurationClick(
                                    item.instanceId,
                                    item.duration,
                                    item.notes,
                                    e
                                  )
                                }
                                onDragStart={() => handleDragStart(item.instanceId)}
                                onDragEnd={handleDragEnd}
                              />

                              {/* Drop zone after this item */}
                              {draggedItemId && draggedItemId !== item.instanceId && (
                                <DropZonePlaceholder
                                  onDrop={() => handleDrop(globalIndex + 1, group.section!.id)}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {group.type === "ungrouped" && (
                  <div className="ml-2 mt-2">
                    {/* Drop zone at the start of ungrouped section */}
                    {draggedItemId && group.items.length === 0 && (
                      <DropZonePlaceholder
                        onDrop={() => {
                          const firstUngroupedIndex = timeline.findIndex(
                            (item) =>
                              !item.sectionId ||
                              !sections.find((s) => s.id === item.sectionId)
                          );
                          if (firstUngroupedIndex !== -1) {
                            handleDrop(firstUngroupedIndex, undefined);
                          } else {
                            // Empty ungrouped - add at the end
                            handleDrop(timeline.length, undefined);
                          }
                        }}
                      />
                    )}

                    {group.items.map((item, itemIndex) => {
                      const globalIndex = timeline.indexOf(item);
                      return (
                        <React.Fragment key={item.instanceId}>
                          {/* Drop zone before this item */}
                          {draggedItemId && draggedItemId !== item.instanceId && itemIndex === 0 && (
                            <DropZonePlaceholder
                              onDrop={() => handleDrop(globalIndex, undefined)}
                            />
                          )}

                          <DrillItemCard
                            item={item}
                            index={globalIndex}
                            totalItems={timeline.length}
                            isDragging={draggedItemId === item.instanceId}
                            onMoveUp={() => handleMoveDrill(item.instanceId, -1)}
                            onMoveDown={() => handleMoveDrill(item.instanceId, 1)}
                            onRemove={() => handleRemoveDrill(item.instanceId)}
                            onViewDetails={() => onViewDrillDetails(item.drill)}
                            onDurationClick={(e) =>
                              handleDurationClick(
                                item.instanceId,
                                item.duration,
                                item.notes,
                                e
                              )
                            }
                            onDragStart={() => handleDragStart(item.instanceId)}
                            onDragEnd={handleDragEnd}
                          />

                          {/* Drop zone after this item */}
                          {draggedItemId && draggedItemId !== item.instanceId && (
                            <DropZonePlaceholder
                              onDrop={() => handleDrop(globalIndex + 1, undefined)}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Drop zone at bottom */}
            {draggedItemId ? (
              <div className="mt-4">
                <DropZonePlaceholder
                  onDrop={() => handleDrop(timeline.length, undefined)}
                />
              </div>
            ) : (
              <div
                className="mt-4 rounded-xl border-2 border-dashed border-border/50 p-6 text-center transition-all hover:border-accent/40 hover:bg-accent/5 group"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(timeline.length, undefined)}
              >
                <Plus size={20} className="mx-auto mb-2 text-muted/50 group-hover:text-accent transition-colors" />
                <p className="text-sm text-muted group-hover:text-foreground transition-colors">
                  Drop drills here or browse library
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Duration Editor Popover */}
      {editingDuration && (
        <DurationEditor
          instanceId={editingDuration.instanceId}
          duration={editingDuration.duration}
          notes={editingDuration.notes}
          position={editingDuration.position}
          onSave={handleSaveDuration}
          onCancel={() => setEditingDuration(null)}
        />
      )}
    </div>
  );
};

export default TimelineBuilderPanel;

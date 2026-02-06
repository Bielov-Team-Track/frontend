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
  Download,
  X,
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
      className="fixed z-50 min-w-[220px] rounded-xl border border-border bg-raised/95 p-4 shadow-lg backdrop-blur-lg"
      style={{ left: position.x, top: position.y }}
    >
      <label className="mb-2 block text-xs font-medium text-muted">
        Duration (minutes)
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAdjust(-5)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-subtle text-foreground hover:bg-hover"
        >
          -5
        </button>
        <Input
          type="number"
          value={localDuration}
          onChange={(e) => setLocalDuration(Math.max(1, parseInt(e.target.value) || 1))}
          className="flex-1 text-center"
          min={1}
        />
        <button
          onClick={() => handleAdjust(5)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-subtle text-foreground hover:bg-hover"
        >
          +5
        </button>
      </div>
      <label className="mb-1 mt-3 block text-xs text-muted">Notes</label>
      <TextArea
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        placeholder="Optional coach notes..."
        rows={2}
        className="resize-none"
      />
      <div className="mt-3 flex gap-2">
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
      className="mb-2 flex items-center justify-center rounded-xl border-2 border-dashed border-accent/50 bg-accent/10 p-3 text-center text-sm text-accent transition-all duration-200"
    >
      <span className="flex items-center gap-2">
        <ChevronDown size={16} />
        Drop here
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
      className={`group relative mb-2 flex cursor-move items-start gap-3 rounded-xl p-3 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        isDragging
          ? "opacity-60 border-2 border-dashed border-accent bg-accent/20"
          : "border border-border bg-subtle/30 hover:border-primary/30 hover:bg-hover"
      }`}
    >
      {/* Category color bar */}
      <div
        className="h-full w-1 flex-shrink-0 rounded-full"
        style={{ background: categoryColor }}
      />

      {/* Drag handle */}
      <div className={`flex-shrink-0 pt-1 transition-colors duration-200 ${
        isDragging ? "text-accent" : "text-muted/50 group-hover:text-muted"
      }`}>
        <GripVertical size={16} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-medium text-foreground">
          {item.drill.name}
        </h4>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {/* Duration - clickable */}
          <button
            onClick={onDurationClick}
            className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors"
          >
            <Clock size={12} />
            {item.duration}m
          </button>

          {/* Category badge */}
          <Badge
            variant="custom"
            style={{
              background: `${categoryColor}20`,
              color: categoryColor,
              borderColor: `${categoryColor}40`,
            }}
          >
            {item.drill.category}
          </Badge>

          {/* Intensity badge */}
          <Badge
            variant="custom"
            style={{
              background: `${intensityColor}20`,
              color: intensityColor,
              borderColor: `${intensityColor}40`,
            }}
          >
            {item.drill.intensity}
          </Badge>
        </div>

        {/* Notes preview */}
        {item.notes && (
          <p className="mt-1.5 text-xs text-muted/70 line-clamp-1">
            {item.notes}
          </p>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {index > 0 && (
          <button
            onClick={onMoveUp}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Move drill up"
          >
            <ChevronUp size={14} />
          </button>
        )}
        {index < totalItems - 1 && (
          <button
            onClick={onMoveDown}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Move drill down"
          >
            <ChevronDown size={14} />
          </button>
        )}
        <button
          onClick={onViewDetails}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="View drill details"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:border-error/30 hover:text-error focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="Remove drill from timeline"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// Main Component
export const TimelineBuilderPanel: React.FC<TimelineBuilderPanelProps> = ({
  timeline,
  sections,
  onTimelineChange,
  onSectionsChange,
  onViewDrillDetails,
}) => {
  const [editingDuration, setEditingDuration] = useState<{
    instanceId: string;
    duration: number;
    notes: string;
    position: { x: number; y: number };
  } | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

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
            {/* Timeline line */}
            <div className="absolute bottom-2 left-3 top-2 w-0.5 bg-border" />
            <div className="absolute left-[5px] top-0 z-10 h-[13px] w-[13px] rounded-full border-[3px] border-base bg-accent" />

            {/* Ordered sections and items */}
            {orderedTimeline.map((group, groupIndex) => (
              <div key={groupIndex}>
                {group.type === "section" && group.section && (
                  <div className="relative mb-2 mt-4 first:mt-0">
                    {/* Section dot */}
                    <div
                      className="absolute left-[-25px] top-1/2 z-10 h-[13px] w-[13px] -translate-y-1/2 rounded-full border-[3px] border-base"
                      style={{ background: group.section.color }}
                    />

                    {/* Section header */}
                    <div
                      className="ml-2 flex items-center justify-between rounded-xl px-4 py-2.5"
                      style={{
                        background: `${group.section.color}10`,
                        border: `1px solid ${group.section.color}30`,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: group.section.color }}
                        />
                        <input
                          type="text"
                          value={group.section.name}
                          onChange={(e) =>
                            handleSectionNameChange(
                              group.section!.id,
                              e.target.value
                            )
                          }
                          className="cursor-text rounded bg-transparent px-1 text-xs font-bold uppercase tracking-wider outline-none transition-all hover:bg-white/5 focus:bg-white/10 focus:ring-1 focus:ring-white/20"
                          style={{ color: group.section.color }}
                        />
                        <span className="text-[10px] text-muted">
                          {group.items.length} drill
                          {group.items.length !== 1 ? "s" : ""} ·{" "}
                          {group.items.reduce(
                            (sum, item) => sum + item.duration,
                            0
                          )}
                          m
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteSection(group.section!.id)}
                        className="rounded-lg p-1 text-muted/50 transition-all hover:bg-hover hover:text-error"
                        title="Delete section"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Section items */}
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
                className="mt-4 rounded-xl border-2 border-dashed border-border p-5 text-center transition-all hover:border-primary/30"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(timeline.length, undefined)}
              >
                <p className="text-sm text-muted">
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

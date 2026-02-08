"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Drill, DrillCategory, DrillIntensity } from "@/lib/models/Drill";
import { Button, Badge, Input, TextArea, Card, Modal } from "@/components";
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
  StickyNote,
  AlertTriangle,
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
  onAddDrill?: (drill: Drill) => void;
  sessionDuration?: number;
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
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 min-w-[240px] rounded-xl border border-border/80 bg-raised/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-200"
      style={{ left: position.x, top: position.y }}
    >
      <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-l border-t border-border/80 bg-raised/95" />
      <label className="mb-2 block text-xs font-semibold text-foreground">Duration (minutes)</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLocalDuration((prev) => Math.max(1, prev - 5))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-subtle text-foreground hover:bg-hover text-sm font-medium"
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
          onClick={() => setLocalDuration((prev) => prev + 5)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-subtle text-foreground hover:bg-hover text-sm font-medium"
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
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(localDuration, localNotes)} className="flex-1">
          Save
        </Button>
      </div>
    </div>
  );
};

// Sortable Drill Card
interface SortableDrillCardProps {
  item: TimelineItem;
  cumulativeTime: number;
  onRemove: () => void;
  onViewDetails: () => void;
  onDurationClick: (event: React.MouseEvent) => void;
  isOverlay?: boolean;
}

const SortableDrillCard: React.FC<SortableDrillCardProps> = ({
  item,
  cumulativeTime,
  onRemove,
  onViewDetails,
  onDurationClick,
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.instanceId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryColor = CATEGORY_COLORS[item.drill.category];
  const intensityColor = INTENSITY_COLORS[item.drill.intensity];

  return (
    <div
      ref={setNodeRef}
      style={isOverlay ? undefined : style}
      className={`group flex items-start gap-2 mb-2 ${isDragging && !isOverlay ? 'z-50' : ''}`}
    >
      {/* Time marker */}
      <div className="flex-shrink-0 w-10 pt-3 text-right">
        <span className="text-[11px] font-medium tabular-nums text-muted">
          {cumulativeTime}m
        </span>
      </div>

      {/* Drill card */}
      <div
        className={`flex-1 flex items-center gap-3 rounded-xl p-3 border transition-all ${
          isDragging || isOverlay
            ? "border-accent bg-accent/10 shadow-lg"
            : "border-border/50 bg-surface/80 shadow-sm hover:border-accent/30 hover:bg-surface"
        }`}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted/30 hover:text-muted touch-none"
        >
          <GripVertical size={16} />
        </button>

        {/* Category color indicator */}
        <div className="w-1 h-8 flex-shrink-0 rounded-full" style={{ background: categoryColor }} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground truncate">{item.drill.name}</h4>
            <button
              onClick={onDurationClick}
              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-accent rounded px-1.5 py-0.5 hover:bg-accent/10"
            >
              <Clock size={12} />
              <span className="tabular-nums">{item.duration}m</span>
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="custom" className="text-[10px] px-1.5 py-0.5" style={{ background: `${categoryColor}15`, color: categoryColor }}>
              {item.drill.category}
            </Badge>
            <Badge variant="custom" className="text-[10px] px-1.5 py-0.5" style={{ background: `${intensityColor}15`, color: intensityColor, borderColor: `${intensityColor}30`, borderWidth: '1px' }}>
              {item.drill.intensity}
            </Badge>
            {item.notes && <span className="flex items-center gap-1 text-[10px] text-muted/60"><StickyNote size={10} />Note</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onViewDetails} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:text-foreground">
            <Eye size={14} />
          </button>
          <button onClick={onRemove} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-subtle text-muted hover:text-error">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sortable Section Header
interface SortableSectionProps {
  section: Section;
  itemCount: number;
  totalDuration: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
  children: React.ReactNode;
}

const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  itemCount,
  totalDuration,
  isCollapsed,
  onToggleCollapse,
  onDelete,
  onNameChange,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${section.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          {...attributes}
          {...listeners}
          className={`flex-1 flex items-center justify-between rounded-xl px-4 py-2.5 cursor-grab active:cursor-grabbing transition-all ${
            isDragging ? 'shadow-lg' : 'hover:shadow-md'
          }`}
          style={{
            background: `linear-gradient(135deg, ${section.color}08 0%, ${section.color}15 100%)`,
            border: `1.5px solid ${section.color}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <GripVertical size={14} className="text-muted/30" />

            <button onClick={onToggleCollapse} className="p-1 rounded hover:bg-white/10">
              {isCollapsed ? (
                <ChevronRight size={14} style={{ color: section.color }} />
              ) : (
                <ChevronDown size={14} style={{ color: section.color }} />
              )}
            </button>

            <div className="h-2.5 w-2.5 rounded-full" style={{ background: section.color }} />

            <input
              type="text"
              value={section.name}
              onChange={(e) => onNameChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-transparent px-1 text-xs font-bold uppercase tracking-wider outline-none hover:bg-white/10 focus:bg-white/15 rounded"
              style={{ color: section.color }}
            />

            <div className="flex items-center gap-2 text-[10px] font-medium text-muted">
              <span>{itemCount} drills</span>
              <span>·</span>
              <span style={{ color: section.color }}>{totalDuration}m</span>
            </div>
          </div>

          <button
            onClick={onDelete}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 text-muted/50 hover:bg-error/10 hover:text-error transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Section content */}
      {!isCollapsed && (
        <div className="ml-6 min-h-[40px]">
          {children}
        </div>
      )}
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
  onAddDrill,
  sessionDuration = 90,
}) => {
  const [editingDuration, setEditingDuration] = useState<{
    instanceId: string;
    duration: number;
    notes: string;
    position: { x: number; y: number };
  } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle external drop (from drill library)
  const handleExternalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleExternalDragLeave = (e: React.DragEvent) => {
    // Only set to false if leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleExternalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData("application/json");
      if (data && onAddDrill) {
        const drill = JSON.parse(data) as Drill;
        onAddDrill(drill);
      }
    } catch (err) {
      console.error("Failed to parse dropped drill:", err);
    }
  };

  // Sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Calculate totals
  const totalDuration = timeline.reduce((sum, item) => sum + item.duration, 0);
  const progressPercent = Math.min((totalDuration / sessionDuration) * 100, 100);
  const isOvertime = totalDuration > sessionDuration;

  // Group items by section (memoized)
  const groupedItems = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    map.set('__ungrouped__', []);
    sections.forEach(s => map.set(s.id, []));

    timeline.forEach(item => {
      const key = item.sectionId && sections.find(s => s.id === item.sectionId)
        ? item.sectionId
        : '__ungrouped__';
      map.get(key)!.push(item);
    });

    return map;
  }, [timeline, sections]);

  // Get cumulative time for an item
  const getCumulativeTime = (instanceId: string) => {
    let time = 0;
    for (const item of timeline) {
      if (item.instanceId === instanceId) return time;
      time += item.duration;
    }
    return time;
  };

  // Section handlers
  const handleAddSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: `Section ${sections.length + 1}`,
      color: SECTION_COLORS[sections.length % SECTION_COLORS.length],
    };
    onSectionsChange([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) => {
    setDeletingSectionId(sectionId);
  };

  const handleConfirmDeleteKeepDrills = () => {
    if (!deletingSectionId) return;
    const updatedTimeline = timeline.map((item) =>
      item.sectionId === deletingSectionId ? { ...item, sectionId: undefined } : item
    );
    onTimelineChange(updatedTimeline);
    onSectionsChange(sections.filter((s) => s.id !== deletingSectionId));
    setDeletingSectionId(null);
  };

  const handleConfirmDeleteWithDrills = () => {
    if (!deletingSectionId) return;
    const updatedTimeline = timeline.filter((item) => item.sectionId !== deletingSectionId);
    onTimelineChange(updatedTimeline);
    onSectionsChange(sections.filter((s) => s.id !== deletingSectionId));
    setDeletingSectionId(null);
  };

  const handleSectionNameChange = (sectionId: string, newName: string) => {
    onSectionsChange(sections.map((s) => (s.id === sectionId ? { ...s, name: newName } : s)));
  };

  const toggleSectionCollapse = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const handleClearAll = () => {
    onTimelineChange([]);
    onSectionsChange([]);
  };

  // Item handlers
  const handleRemoveDrill = (instanceId: string) => {
    onTimelineChange(timeline.filter((item) => item.instanceId !== instanceId));
  };

  const handleDurationClick = (instanceId: string, duration: number, notes: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setEditingDuration({ instanceId, duration, notes, position: { x: rect.left, y: rect.bottom + 8 } });
  };

  const handleSaveDuration = (duration: number, notes: string) => {
    if (!editingDuration) return;
    onTimelineChange(
      timeline.map((item) =>
        item.instanceId === editingDuration.instanceId ? { ...item, duration, notes } : item
      )
    );
    setEditingDuration(null);
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging an item over a section
    if (!activeId.startsWith('section-') && overId.startsWith('section-')) {
      const sectionId = overId.replace('section-', '');
      const activeItem = timeline.find(item => item.instanceId === activeId);

      if (activeItem && activeItem.sectionId !== sectionId) {
        // Move item to this section
        onTimelineChange(
          timeline.map(item =>
            item.instanceId === activeId ? { ...item, sectionId } : item
          )
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Section reordering
    if (activeId.startsWith('section-') && overId.startsWith('section-')) {
      const activeSectionId = activeId.replace('section-', '');
      const overSectionId = overId.replace('section-', '');

      const oldIndex = sections.findIndex(s => s.id === activeSectionId);
      const newIndex = sections.findIndex(s => s.id === overSectionId);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder sections array
        const newSections = [...sections];
        const [removed] = newSections.splice(oldIndex, 1);
        newSections.splice(newIndex, 0, removed);

        // Reorder timeline items to match new section order
        // Group items by section, then rebuild timeline in new section order
        const ungrouped = timeline.filter(item => !item.sectionId || !sections.find(s => s.id === item.sectionId));
        const itemsBySection = new Map<string, TimelineItem[]>();
        sections.forEach(s => itemsBySection.set(s.id, []));
        timeline.forEach(item => {
          if (item.sectionId && itemsBySection.has(item.sectionId)) {
            itemsBySection.get(item.sectionId)!.push(item);
          }
        });

        // Rebuild timeline: sections in new order, then ungrouped items
        const newTimeline: TimelineItem[] = [];
        newSections.forEach(section => {
          const sectionItems = itemsBySection.get(section.id) || [];
          newTimeline.push(...sectionItems);
        });
        newTimeline.push(...ungrouped);

        onSectionsChange(newSections);
        onTimelineChange(newTimeline);
      }
      return;
    }

    // Item reordering
    if (!activeId.startsWith('section-') && !overId.startsWith('section-')) {
      const oldIndex = timeline.findIndex(item => item.instanceId === activeId);
      const newIndex = timeline.findIndex(item => item.instanceId === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTimeline = [...timeline];
        const [removed] = newTimeline.splice(oldIndex, 1);

        // Adopt the section of the target position
        const targetItem = timeline[newIndex];
        removed.sectionId = targetItem.sectionId;

        newTimeline.splice(newIndex, 0, removed);
        onTimelineChange(newTimeline);
      }
    }
  };

  // Get the active item for drag overlay
  const activeItem = activeId && !activeId.startsWith('section-')
    ? timeline.find(item => item.instanceId === activeId)
    : null;

  // Build section and item IDs for sortable contexts
  const sectionIds = sections.map(s => `section-${s.id}`);
  const allItemIds = timeline.map(item => item.instanceId);

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
              className={`h-full transition-all duration-500 ease-out ${
                isOvertime
                  ? "bg-gradient-to-r from-warning/80 to-warning"
                  : "bg-gradient-to-r from-accent/80 to-accent"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="font-medium text-muted">Session Progress</span>
            <span className={`font-semibold tabular-nums ${isOvertime ? "text-warning" : "text-accent"}`}>
              {totalDuration}m / {sessionDuration}m
              {isOvertime && " (overtime)"}
            </span>
          </div>
        </div>
      )}

      {/* Timeline Area */}
      <div
        className={`min-h-[400px] rounded-xl transition-colors ${isDragOver ? 'bg-accent/5 ring-2 ring-accent/30 ring-dashed' : ''}`}
        onDragOver={handleExternalDragOver}
        onDragLeave={handleExternalDragLeave}
        onDrop={handleExternalDrop}
      >
        {timeline.length === 0 && sections.length === 0 ? (
          <Card className={`p-12 text-center transition-all ${isDragOver ? 'border-accent border-dashed bg-accent/5' : ''}`}>
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${isDragOver ? 'bg-accent/20' : 'bg-subtle'}`}>
              <Clock size={28} className={isDragOver ? 'text-accent' : 'text-muted'} strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 text-lg font-bold text-foreground">
              {isDragOver ? 'Drop drill here' : 'Build your training timeline'}
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-sm text-muted">
              Drag drills from the library or click to add them to your session
            </p>
            {!isDragOver && (
              <Button variant="outline" className="mx-auto">
                <Download size={16} />
                Load Template
              </Button>
            )}
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Sections */}
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
              {sections.map((section) => {
                const sectionItems = groupedItems.get(section.id) || [];
                const sectionDuration = sectionItems.reduce((sum, item) => sum + item.duration, 0);

                return (
                  <SortableSection
                    key={section.id}
                    section={section}
                    itemCount={sectionItems.length}
                    totalDuration={sectionDuration}
                    isCollapsed={collapsedSections.has(section.id)}
                    onToggleCollapse={() => toggleSectionCollapse(section.id)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onNameChange={(name) => handleSectionNameChange(section.id, name)}
                  >
                    {sectionItems.length === 0 ? (
                      <div className="py-4 text-center text-sm rounded-lg border-2 border-dashed border-border/30 text-muted/50">
                        Drag drills here
                      </div>
                    ) : (
                      <SortableContext items={sectionItems.map(i => i.instanceId)} strategy={verticalListSortingStrategy}>
                        {sectionItems.map((item) => (
                          <SortableDrillCard
                            key={item.instanceId}
                            item={item}
                            cumulativeTime={getCumulativeTime(item.instanceId)}
                            onRemove={() => handleRemoveDrill(item.instanceId)}
                            onViewDetails={() => onViewDrillDetails(item.drill)}
                            onDurationClick={(e) => handleDurationClick(item.instanceId, item.duration, item.notes, e)}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </SortableSection>
                );
              })}
            </SortableContext>

            {/* Ungrouped items */}
            {(groupedItems.get('__ungrouped__') || []).length > 0 && (
              <div className="mb-4">
                <SortableContext items={(groupedItems.get('__ungrouped__') || []).map(i => i.instanceId)} strategy={verticalListSortingStrategy}>
                  {(groupedItems.get('__ungrouped__') || []).map((item) => (
                    <SortableDrillCard
                      key={item.instanceId}
                      item={item}
                      cumulativeTime={getCumulativeTime(item.instanceId)}
                      onRemove={() => handleRemoveDrill(item.instanceId)}
                      onViewDetails={() => onViewDrillDetails(item.drill)}
                      onDurationClick={(e) => handleDurationClick(item.instanceId, item.duration, item.notes, e)}
                    />
                  ))}
                </SortableContext>
              </div>
            )}

            {/* End time marker */}
            {timeline.length > 0 && (
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                <div className="flex-shrink-0 w-10 text-right">
                  <span className="text-[11px] font-semibold tabular-nums text-accent">{totalDuration}m</span>
                </div>
                <span className="text-xs text-muted">End of session</span>
              </div>
            )}

            {/* Drop zone at bottom */}
            <div className={`mt-4 ml-6 rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragOver
                ? 'border-accent bg-accent/10'
                : 'border-border/50 hover:border-accent/40 hover:bg-accent/5'
            }`}>
              <Plus size={20} className={`mx-auto mb-2 ${isDragOver ? 'text-accent' : 'text-muted/50'}`} />
              <p className={`text-sm ${isDragOver ? 'text-accent font-medium' : 'text-muted'}`}>
                {isDragOver ? 'Drop to add drill' : 'Drop drills here or browse library'}
              </p>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeItem && (
                <SortableDrillCard
                  item={activeItem}
                  cumulativeTime={getCumulativeTime(activeItem.instanceId)}
                  onRemove={() => {}}
                  onViewDetails={() => {}}
                  onDurationClick={() => {}}
                  isOverlay
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Duration Editor Popover */}
      {editingDuration && (
        <DurationEditor
          duration={editingDuration.duration}
          notes={editingDuration.notes}
          position={editingDuration.position}
          onSave={handleSaveDuration}
          onCancel={() => setEditingDuration(null)}
        />
      )}

      {/* Delete Section Confirmation Modal */}
      <Modal
        isOpen={!!deletingSectionId}
        onClose={() => setDeletingSectionId(null)}
        size="sm"
        showCloseButton={false}
      >
        {(() => {
          const sectionToDelete = sections.find(s => s.id === deletingSectionId);
          const drillsInSection = timeline.filter(item => item.sectionId === deletingSectionId);

          return (
            <div className="text-center">
              <div className="flex h-12 w-12 mx-auto mb-4 items-center justify-center rounded-full bg-warning/10">
                <AlertTriangle size={24} className="text-warning" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Delete "{sectionToDelete?.name}"?</h3>
              <p className="text-sm text-muted mb-6">
                {drillsInSection.length > 0
                  ? `This section contains ${drillsInSection.length} drill${drillsInSection.length > 1 ? 's' : ''}. What would you like to do with them?`
                  : 'This section is empty and will be removed.'}
              </p>
              <div className="flex flex-col gap-2">
                {drillsInSection.length > 0 ? (
                  <>
                    <Button variant="outline" onClick={handleConfirmDeleteKeepDrills} className="justify-start gap-3 h-auto py-3 px-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <GripVertical size={16} className="text-accent" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Keep drills</div>
                        <div className="text-xs text-muted">Move drills to ungrouped</div>
                      </div>
                    </Button>
                    <Button variant="outline" onClick={handleConfirmDeleteWithDrills} className="justify-start gap-3 h-auto py-3 px-4 hover:border-error/30 hover:bg-error/5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error/10">
                        <Trash2 size={16} className="text-error" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-error">Delete everything</div>
                        <div className="text-xs text-muted">Remove section and all drills</div>
                      </div>
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleConfirmDeleteKeepDrills}>Delete Section</Button>
                )}
                <Button variant="ghost" onClick={() => setDeletingSectionId(null)} className="mt-1">Cancel</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default TimelineBuilderPanel;

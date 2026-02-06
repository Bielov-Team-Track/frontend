"use client";

import { Badge } from "@/components/ui";
import { useDrills } from "@/hooks/useDrills";
import { Drill } from "@/lib/models/Drill";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORY_COLORS, INTENSITY_COLORS } from "./types";

interface SelectedDrill {
    drillId: string;
    drillName: string;
    drillCategory: string;
    drillIntensity: string;
    note?: string;
}

interface DrillSelectorProps {
    selectedDrills: SelectedDrill[];
    onChange: (drills: SelectedDrill[]) => void;
    excludeDrillIds?: string[];
    placeholder?: string;
}

export default function DrillSelector({
    selectedDrills,
    onChange,
    excludeDrillIds = [],
    placeholder = "Search for a drill to add as variation...",
}: DrillSelectorProps) {
    const { data: allDrills = [] } = useDrills();
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Filter drills based on search and exclusions
    const availableDrills = useMemo(() => {
        const selectedIds = new Set(selectedDrills.map((d) => d.drillId));
        const excludeIds = new Set([...excludeDrillIds, ...selectedIds]);

        return allDrills.filter((drill) => {
            if (excludeIds.has(drill.id)) return false;
            if (!search.trim()) return true;

            const searchLower = search.toLowerCase();
            return (
                drill.name.toLowerCase().includes(searchLower) ||
                drill.category.toLowerCase().includes(searchLower) ||
                drill.skills.some((s) => s.toLowerCase().includes(searchLower))
            );
        });
    }, [allDrills, selectedDrills, excludeDrillIds, search]);

    const handleSelect = (drill: Drill) => {
        onChange([
            ...selectedDrills,
            {
                drillId: drill.id,
                drillName: drill.name,
                drillCategory: drill.category,
                drillIntensity: drill.intensity,
            },
        ]);
        setSearch("");
        setIsOpen(false);
    };

    const handleRemove = (drillId: string) => {
        onChange(selectedDrills.filter((d) => d.drillId !== drillId));
    };

    const handleNoteChange = (drillId: string, note: string) => {
        onChange(
            selectedDrills.map((d) =>
                d.drillId === drillId ? { ...d, note: note || undefined } : d
            )
        );
    };

    return (
        <div className="space-y-3">
            {/* Selected drills */}
            {selectedDrills.length > 0 && (
                <div className="space-y-2">
                    {selectedDrills.map((drill, index) => (
                        <div
                            key={drill.drillId}
                            className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-border"
                        >
                            <span className="text-accent font-medium text-sm mt-1">
                                {index + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-white font-medium text-sm truncate">
                                        {drill.drillName}
                                    </span>
                                    <Badge
                                        color={CATEGORY_COLORS[drill.drillCategory as keyof typeof CATEGORY_COLORS]?.color || "neutral"}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        {drill.drillCategory}
                                    </Badge>
                                    <Badge
                                        color={INTENSITY_COLORS[drill.drillIntensity as keyof typeof INTENSITY_COLORS]?.color || "neutral"}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {drill.drillIntensity}
                                    </Badge>
                                </div>
                                <input
                                    type="text"
                                    value={drill.note || ""}
                                    onChange={(e) => handleNoteChange(drill.drillId, e.target.value)}
                                    placeholder="Add a note (optional)"
                                    className="mt-2 w-full px-2 py-1 rounded bg-surface border border-border text-muted text-xs placeholder:text-muted/50 focus:outline-hidden focus:border-accent"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(drill.drillId)}
                                className="p-1 rounded hover:bg-hover text-muted hover:text-error transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search input */}
            <div className="relative">
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent text-sm"
                    />
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-xl bg-card border border-border shadow-xl">
                        {availableDrills.length === 0 ? (
                            <div className="p-3 text-center text-muted text-sm">
                                {search ? "No drills found" : "No more drills available"}
                            </div>
                        ) : (
                            availableDrills.slice(0, 10).map((drill) => (
                                <button
                                    key={drill.id}
                                    type="button"
                                    onClick={() => handleSelect(drill)}
                                    className="w-full px-3 py-2 text-left hover:bg-surface transition-colors flex items-center gap-2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white text-sm font-medium truncate">
                                            {drill.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-muted">
                                                {drill.category}
                                            </span>
                                            <span className="text-xs text-muted">•</span>
                                            <span className="text-xs text-muted">
                                                {drill.intensity}
                                            </span>
                                            {drill.duration && (
                                                <>
                                                    <span className="text-xs text-muted">•</span>
                                                    <span className="text-xs text-muted">
                                                        {drill.duration} min
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import {
	CATEGORY_SEGMENT_COLORS,
	INTENSITY_SEGMENT_COLORS,
	CATEGORY_PILL_COLORS,
	INTENSITY_PILL_COLORS,
	CATEGORY_LABELS,
	INTENSITY_LABELS,
	SECTION_COLORS,
} from "./colors";
import type { PlanSection, PlanItem } from "@/lib/models/Template";

interface SessionTimelineSummaryProps {
	sections: PlanSection[];
	allItemsInOrder: (PlanItem & { sectionIndex: number })[];
	categoryDistribution: [string, number][];
	intensityDistribution: [string, number][];
	totalDuration: number;
}

export default function SessionTimelineSummary({
	sections,
	allItemsInOrder,
	categoryDistribution,
	intensityDistribution,
	totalDuration,
}: SessionTimelineSummaryProps) {
	const [timelineView, setTimelineView] = useState<"categories" | "intensity">("categories");

	if (allItemsInOrder.length === 0 || totalDuration <= 0) return null;

	return (
		<div className="bg-surface border border-border rounded-2xl p-4 md:p-5">
			<div className="flex items-center justify-between mb-3">
				<h2 className="text-sm font-semibold text-foreground">Session Timeline</h2>
				<div className="flex gap-1 bg-card rounded-lg p-1">
					{(["categories", "intensity"] as const).map((view) => (
						<button
							key={view}
							type="button"
							onClick={() => setTimelineView(view)}
							className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
								timelineView === view
									? "bg-surface text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}>
							{view === "categories" ? "Categories" : "Intensity"}
						</button>
					))}
				</div>
			</div>

			{/* Section bands (thin) */}
			{sections.length > 0 && (
				<div className="relative flex mb-1">
					{sections.map((section, idx) => {
						const sectionDuration = section.items.reduce((sum, item) => sum + (item.duration || 0), 0);
						const widthPercent = (sectionDuration / totalDuration) * 100;
						const sColor = SECTION_COLORS[idx % SECTION_COLORS.length];
						return (
							<div
								key={section.id}
								className="flex flex-col items-start overflow-hidden"
								style={{ width: `${widthPercent}%` }}>
								<span className="text-[10px] font-medium text-muted-foreground truncate px-1 mb-0.5">{section.name}</span>
								<div className="w-full h-1 first:rounded-l-sm last:rounded-r-sm" style={{ background: sColor.line }} />
							</div>
						);
					})}
				</div>
			)}

			{/* Timeline bar (colored segments with drill names) */}
			<div className="relative flex rounded-lg overflow-hidden mb-2" style={{ height: 32, background: "#1E292B" }}>
				{allItemsInOrder.map((item, idx) => {
					const widthPercent = ((item.duration || 0) / totalDuration) * 100;
					const cat = (item.drill?.category || "Technical") as keyof typeof CATEGORY_SEGMENT_COLORS;
					const int = (item.drill?.intensity || "Medium") as keyof typeof INTENSITY_SEGMENT_COLORS;
					const barColor = timelineView === "categories"
						? CATEGORY_SEGMENT_COLORS[cat] || "#666"
						: INTENSITY_SEGMENT_COLORS[int] || "#666";
					return (
						<div
							key={item.id || idx}
							className="relative group flex items-center overflow-hidden cursor-pointer hover:brightness-125 transition-all"
							style={{
								width: `${widthPercent}%`,
								background: barColor,
								borderRight: idx < allItemsInOrder.length - 1 ? "1px solid rgba(18,26,27,0.5)" : "none",
							}}>
							{widthPercent > 8 && (
								<span className="px-2 text-[9px] font-medium text-white/90 truncate pointer-events-none drop-shadow-sm">
									{item.drill?.name || "Drill"}
								</span>
							)}
							<div className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 bg-card border border-border px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
								{item.drill?.name || "Drill"} ({item.duration}m)
							</div>
						</div>
					);
				})}
			</div>

			{/* Time markers */}
			<div className="relative h-5 mb-3">
				{Array.from({ length: Math.floor(totalDuration / 15) + 1 }, (_, i) => i * 15).map((time) => (
					<div
						key={time}
						className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
						style={{ left: `${(time / totalDuration) * 100}%` }}>
						{time}m
					</div>
				))}
			</div>

			{/* Legend badges */}
			<div className="flex flex-wrap gap-1.5">
				{timelineView === "categories"
					? categoryDistribution.map(([cat, dur]) => {
						const label = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS];
						const pillColor = CATEGORY_PILL_COLORS[cat as keyof typeof CATEGORY_PILL_COLORS];
						if (!label || !pillColor) return null;
						return (
							<Badge
								key={cat}
								size="sm"
								variant="soft"
								className="text-xs font-semibold border px-2.5 py-1"
								style={{
									background: `${pillColor}20`,
									borderColor: `${pillColor}50`,
									color: pillColor,
								}}>
								<span className="w-2 h-2 rounded-full shrink-0" style={{ background: pillColor }} />
								{label} · {dur}m
							</Badge>
						);
					})
					: intensityDistribution.map(([int, dur]) => {
						const label = INTENSITY_LABELS[int as keyof typeof INTENSITY_LABELS];
						const pillColor = INTENSITY_PILL_COLORS[int as keyof typeof INTENSITY_PILL_COLORS];
						if (!label || !pillColor) return null;
						return (
							<Badge
								key={int}
								size="sm"
								variant="soft"
								className="text-xs font-semibold border px-2.5 py-1"
								style={{
									background: `${pillColor}20`,
									borderColor: `${pillColor}50`,
									color: pillColor,
								}}>
								<span className="w-2 h-2 rounded-full shrink-0" style={{ background: pillColor }} />
								{label} · {dur}m
							</Badge>
						);
					})
				}
			</div>
		</div>
	);
}

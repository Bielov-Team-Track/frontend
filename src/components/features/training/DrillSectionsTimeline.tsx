"use client";

import { useState } from "react";
import { DrillCard, type Drill as ComponentDrill } from "@/components/features/drills";
import {
	INTENSITY_SEGMENT_COLORS,
	SECTION_COLORS,
} from "./colors";
import type { PlanSection, PlanItem } from "@/lib/models/Template";
import { ChevronDown } from "lucide-react";

interface DrillSectionsTimelineProps {
	sections: PlanSection[];
	unassignedItems: PlanItem[];
}

function formatTime(minutes: number): string {
	const m = Math.floor(minutes);
	return `${m}:00`;
}

export default function DrillSectionsTimeline({
	sections,
	unassignedItems,
}: DrillSectionsTimelineProps) {
	const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

	const toggleSection = (sectionId: string) => {
		setCollapsedSections((prev) => {
			const next = new Set(prev);
			if (next.has(sectionId)) {
				next.delete(sectionId);
			} else {
				next.add(sectionId);
			}
			return next;
		});
	};

	const getCumulativeTime = (sectionIndex: number): number => {
		let time = 0;
		for (let i = 0; i < sectionIndex; i++) {
			time += sections[i]?.items.reduce((sum, item) => sum + (item.duration || 0), 0) || 0;
		}
		return time;
	};

	if (sections.length === 0 && unassignedItems.length === 0) {
		return (
			<div className="bg-surface border border-border rounded-2xl p-8 text-center">
				<p className="text-sm text-muted-foreground">No drills added to this training plan yet.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 min-w-0">
			{sections.map((section, sIdx) => {
				const isCollapsed = collapsedSections.has(section.id);
				const sColor = SECTION_COLORS[sIdx % SECTION_COLORS.length];
				const cumulativeTime = getCumulativeTime(sIdx);

				return (
					<div key={section.id} className="flex gap-6">
						{/* Vertical timeline */}
						<div className="w-16 shrink-0 relative hidden md:block">
							<div className="absolute left-[18px] top-0 bottom-0 w-0.5 opacity-40" style={{ background: sColor.line }} />
							{section.items.map((item, iIdx) => {
								const itemTime = cumulativeTime + section.items.slice(0, iIdx).reduce((sum, i) => sum + (i.duration || 0), 0);
								const intKey = (item.drill?.intensity || "Medium") as keyof typeof INTENSITY_SEGMENT_COLORS;
								const dotColor = INTENSITY_SEGMENT_COLORS[intKey] || "#666";
								return (
									<div key={item.id} className="relative pl-9 mb-4">
										<div className="absolute left-[14px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-background" style={{ background: dotColor }} />
										<span className="text-xs font-mono text-muted-foreground">{formatTime(itemTime)}</span>
									</div>
								);
							})}
						</div>

						{/* Section content */}
						<div className="flex-1 min-w-0">
							{/* Section header */}
							<button
								type="button"
								onClick={() => toggleSection(section.id)}
								className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl border-l-4 bg-card/50 hover:bg-hover transition-colors mb-4"
								style={{ borderLeftColor: `${sColor.color}66` }}>
								<div>
									<div className="font-semibold text-foreground text-left">{section.name}</div>
									<div className="text-xs text-muted-foreground mt-0.5">
										{section.items.length} {section.items.length === 1 ? "drill" : "drills"} · {section.duration || section.items.reduce((sum, item) => sum + (item.duration || 0), 0)} min
									</div>
								</div>
								<ChevronDown size={16} className={`text-muted-foreground transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
							</button>

							{/* Drill cards */}
							{!isCollapsed && (
								<div className="space-y-3">
									{section.items.map((item) => (
										<div key={item.id}>
											{item.drill ? (
												<DrillCard
													drill={item.drill as unknown as ComponentDrill}
													variant="compact"
													showAddButton={false}
												/>
											) : (
												<div className="p-3 rounded-lg bg-surface border border-border">
													<p className="text-sm text-muted-foreground">Drill not found</p>
												</div>
											)}
											{item.notes && (
												<p className="text-xs text-muted-foreground mt-1.5 ml-1 italic">
													Note: {item.notes}
												</p>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				);
			})}

			{/* Unassigned items */}
			{unassignedItems.length > 0 && (
				<div>
					<div className="p-4 rounded-xl bg-card/50 border-l-4 border-muted-foreground/30 mb-4">
						<span className="font-semibold text-foreground">Other Drills</span>
					</div>
					<div className="space-y-3">
						{unassignedItems.map((item) => (
							<div key={item.id}>
								{item.drill ? (
									<DrillCard
										drill={item.drill as unknown as ComponentDrill}
										variant="compact"
										showAddButton={false}
									/>
								) : (
									<div className="p-3 rounded-lg bg-surface border border-border">
										<p className="text-sm text-muted-foreground">Drill not found</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

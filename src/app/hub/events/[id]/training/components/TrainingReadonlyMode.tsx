"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components";
import { Badge, EmptyState } from "@/components/ui";
import {
	CATEGORY_COLORS,
	Drill,
	DrillCard,
	DrillDetailModal,
	INTENSITY_COLORS,
	MOCK_DRILLS,
	TimelineItem,
} from "@/components/features/drills";
import {
	CATEGORY_SEGMENT_COLORS,
	INTENSITY_SEGMENT_COLORS,
	CATEGORY_PILL_COLORS,
	INTENSITY_PILL_COLORS,
	CATEGORY_LABELS,
	INTENSITY_LABELS,
} from "@/components/features/training/colors";
import type { DrillCategory, DrillIntensity } from "@/lib/models/Drill";
import { Clock, Dumbbell, Edit2, FileDown, Play, ChevronDown, Layers, Zap, BookOpen } from "lucide-react";
import { useEventContext } from "../../layout";

interface TrainingReadonlyModeProps {
	timeline: TimelineItem[];
	eventDuration: number;
	onStartRun: () => void;
}

export default function TrainingReadonlyMode({ timeline, eventDuration, onStartRun }: TrainingReadonlyModeProps) {
	const { eventId, event } = useEventContext();
	const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
	const [timelineView, setTimelineView] = useState<"categories" | "intensity">("categories");

	const totalDuration = timeline.reduce((acc, item) => acc + item.duration, 0);

	// Category distribution
	const categoryDistribution = useMemo(() => {
		const dist: Record<string, number> = {};
		timeline.forEach((item) => {
			const cat = item.category;
			dist[cat] = (dist[cat] || 0) + item.duration;
		});
		return Object.entries(dist).sort((a, b) => b[1] - a[1]);
	}, [timeline]);

	// Intensity distribution
	const intensityDistribution = useMemo(() => {
		const dist: Record<string, number> = {};
		timeline.forEach((item) => {
			const int = item.intensity;
			dist[int] = (dist[int] || 0) + item.duration;
		});
		return Object.entries(dist).sort((a, b) => b[1] - a[1]);
	}, [timeline]);

	// Skills covered
	const skillsCovered = useMemo(() => {
		const skills = new Set<string>();
		timeline.forEach((item) => item.skills.forEach((s) => skills.add(s)));
		return Array.from(skills);
	}, [timeline]);

	if (timeline.length === 0) {
		return (
			<div className="rounded-2xl bg-surface border border-border p-12">
				<EmptyState
					icon={Dumbbell}
					title="No training plan yet"
					description="Create a training plan to organize drills for this session"
				/>
				<div className="flex justify-center gap-3 mt-6">
					<Button
						color="primary"
						leftIcon={<Edit2 size={16} />}
						onClick={() => {
							// TODO: Navigate to wizard with event context
						}}>
						Create Plan
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				{/* Session Overview */}
				<div className="rounded-2xl bg-surface border border-border p-5">
					{/* Meta row */}
					<div className="flex flex-wrap items-center gap-5 mb-4 text-sm text-muted">
						<span className="flex items-center gap-1.5">
							<Clock size={14} className="text-accent" />
							{totalDuration} min total
						</span>
						<span className="flex items-center gap-1.5">
							<BookOpen size={14} className="text-accent" />
							{timeline.length} {timeline.length === 1 ? "drill" : "drills"}
						</span>
						{totalDuration !== eventDuration && (
							<span className="flex items-center gap-1.5 text-xs">
								<span className={totalDuration > eventDuration ? "text-error" : "text-muted"}>
									{totalDuration > eventDuration
										? `${totalDuration - eventDuration}m over session`
										: `${eventDuration - totalDuration}m remaining`}
								</span>
							</span>
						)}
					</div>

					{/* Timeline bar */}
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-white">Session Timeline</h3>
						<div className="flex gap-1 bg-hover rounded-lg p-1">
							{(["categories", "intensity"] as const).map((view) => (
								<button
									key={view}
									type="button"
									onClick={() => setTimelineView(view)}
									className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
										timelineView === view
											? "bg-surface text-white"
											: "text-muted hover:text-white"
									}`}>
									{view === "categories" ? "Categories" : "Intensity"}
								</button>
							))}
						</div>
					</div>

					{/* Colored segment bar */}
					<div className="relative flex rounded-lg overflow-hidden mb-2" style={{ height: 32, background: "#1E292B" }}>
						{timeline.map((item, idx) => {
							const widthPercent = (item.duration / totalDuration) * 100;
							const barColor =
								timelineView === "categories"
									? CATEGORY_SEGMENT_COLORS[item.category as DrillCategory] || "#666"
									: INTENSITY_SEGMENT_COLORS[item.intensity as DrillIntensity] || "#666";
							return (
								<div
									key={item.instanceId}
									className="relative group flex items-center overflow-hidden cursor-pointer hover:brightness-125 transition-all"
									onClick={() => setSelectedDrill(item)}
									style={{
										width: `${widthPercent}%`,
										background: barColor,
										borderRight: idx < timeline.length - 1 ? "1px solid rgba(18,26,27,0.5)" : "none",
									}}>
									{widthPercent > 8 && (
										<span className="px-2 text-[9px] font-medium text-white/90 truncate pointer-events-none drop-shadow-sm">
											{item.name}
										</span>
									)}
									{/* Tooltip */}
									<div className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 bg-surface border border-border px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
										{item.name} ({item.duration}m)
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
								className="absolute text-[10px] text-muted -translate-x-1/2"
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
								})}
					</div>
				</div>

				{/* Drills + Side Panel */}
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
					{/* Drill list with vertical timeline */}
					<div className="space-y-3">
						{timeline.map((item, index) => {
							const accumulatedTime = timeline.slice(0, index).reduce((a, b) => a + b.duration, 0);
							const intKey = item.intensity as keyof typeof INTENSITY_SEGMENT_COLORS;
							const dotColor = INTENSITY_SEGMENT_COLORS[intKey] || "#666";

							return (
								<div key={item.instanceId} className="flex gap-4">
									{/* Vertical timeline marker */}
									<div className="w-14 shrink-0 relative hidden md:flex flex-col items-center">
										{index === 0 && (
											<div className="w-3 h-3 rounded-full bg-accent border-2 border-background absolute -top-1" />
										)}
										{index > 0 && (
											<div className="w-0.5 bg-border absolute -top-3 bottom-1/2" />
										)}
										<div
											className="w-2.5 h-2.5 rounded-full ring-2 ring-background z-10 mt-4"
											style={{ background: dotColor }}
										/>
										{index < timeline.length - 1 && (
											<div className="w-0.5 bg-border flex-1 mt-1" />
										)}
										<span className="text-[10px] font-mono text-muted mt-1 absolute top-9">
											{formatTime(accumulatedTime)}
										</span>
									</div>

									{/* Drill card */}
									<div className="flex-1 min-w-0">
										<div
											onClick={() => setSelectedDrill(item)}
											className="rounded-xl bg-surface border border-border p-4 hover:border-accent/30 transition-all cursor-pointer">
											<div className="flex items-start gap-3">
												<div className="flex-1 min-w-0">
													<div className="flex items-center justify-between gap-2">
														<h4 className="font-bold text-white">{item.name}</h4>
														<div className="flex items-center gap-1.5 shrink-0">
															<Badge size="xs" color={INTENSITY_COLORS[item.intensity].color} variant="outline">
																{item.intensity}
															</Badge>
															<Badge size="xs" color={CATEGORY_COLORS[item.category].color} variant="ghost">
																{item.category}
															</Badge>
														</div>
													</div>
													<div className="flex items-center gap-3 mt-1.5 text-sm text-muted">
														<span className="flex items-center gap-1">
															<Clock size={13} /> {item.duration} min
														</span>
														<span className="text-xs">
															{item.skills.slice(0, 3).join(", ")}
															{item.skills.length > 3 && ` +${item.skills.length - 3}`}
														</span>
													</div>
													{item.description && (
														<p className="text-xs text-muted/70 mt-2 line-clamp-2">{item.description}</p>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}

						{/* End marker */}
						<div className="flex gap-4">
							<div className="w-14 shrink-0 relative hidden md:flex flex-col items-center">
								<div className="w-0.5 bg-border absolute -top-3 h-3" />
								<div className="w-3 h-3 rounded-full bg-muted/50 border-2 border-background mt-3" />
								<span className="text-[10px] font-mono text-muted mt-1">
									{formatTime(totalDuration)}
								</span>
							</div>
							<div className="flex-1" />
						</div>
					</div>

					{/* Side Panel */}
					<div className="space-y-4 lg:sticky lg:top-6">
						{/* Run action */}
						<div className="rounded-2xl bg-surface border border-border p-4">
							<Button
								fullWidth
								color="primary"
								size="lg"
								leftIcon={<Play size={18} />}
								onClick={onStartRun}>
								Run Session
							</Button>
							<p className="text-xs text-muted text-center mt-2">
								Timer, drill progression & audio cues
							</p>
						</div>

						{/* Category Distribution */}
						{categoryDistribution.length > 0 && (
							<SideCard title="Categories">
								<div className="space-y-2.5">
									{categoryDistribution.map(([cat, dur]) => {
										const label = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS];
										const color = CATEGORY_PILL_COLORS[cat as keyof typeof CATEGORY_PILL_COLORS];
										if (!label || !color) return null;
										const pct = totalDuration > 0 ? (dur / totalDuration) * 100 : 0;
										return (
											<div key={cat}>
												<div className="flex justify-between text-xs mb-1">
													<span style={{ color }}>{label}</span>
													<span className="text-muted">{dur}m</span>
												</div>
												<div className="h-1.5 bg-hover rounded-full overflow-hidden">
													<div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
												</div>
											</div>
										);
									})}
								</div>
							</SideCard>
						)}

						{/* Intensity Distribution */}
						{intensityDistribution.length > 0 && (
							<SideCard title="Intensity">
								<div className="space-y-2.5">
									{intensityDistribution.map(([int, dur]) => {
										const label = INTENSITY_LABELS[int as keyof typeof INTENSITY_LABELS];
										const color = INTENSITY_PILL_COLORS[int as keyof typeof INTENSITY_PILL_COLORS];
										if (!label || !color) return null;
										const pct = totalDuration > 0 ? (dur / totalDuration) * 100 : 0;
										return (
											<div key={int}>
												<div className="flex justify-between text-xs mb-1">
													<span style={{ color }}>{label}</span>
													<span className="text-muted">{dur}m</span>
												</div>
												<div className="h-1.5 bg-hover rounded-full overflow-hidden">
													<div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
												</div>
											</div>
										);
									})}
								</div>
							</SideCard>
						)}

						{/* Skills Covered */}
						{skillsCovered.length > 0 && (
							<SideCard title="Skills Covered">
								<div className="flex flex-wrap gap-1.5">
									{skillsCovered.map((skill) => (
										<Badge key={skill} size="xs" color={getSkillBadgeColor(skill)} variant="soft">
											{skill}
										</Badge>
									))}
								</div>
							</SideCard>
						)}
					</div>
				</div>
			</div>

			<DrillDetailModal drill={selectedDrill} isOpen={!!selectedDrill} onClose={() => setSelectedDrill(null)} />
		</>
	);
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-2xl bg-surface border border-border p-4">
			<h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{title}</h3>
			{children}
		</div>
	);
}

function formatTime(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const SKILL_COLOR_MAP: Record<string, "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error"> = {
	Serving: "accent",
	Passing: "info",
	Setting: "secondary",
	Attacking: "error",
	Blocking: "warning",
	Defense: "primary",
	Conditioning: "success",
	Footwork: "accent",
};

function getSkillBadgeColor(skill: string): "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" {
	return SKILL_COLOR_MAP[skill] || "info";
}

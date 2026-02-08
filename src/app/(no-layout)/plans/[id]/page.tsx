"use client";

// TODO: Temporary public page for showing training plans to unauthorized users.
// Once proper public/private access control is implemented, consolidate
// with the dashboard template detail page or use a shared component.

import { useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge, Loader } from "@/components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	TemplateInteractionBar,
	TemplateCommentsSection,
} from "@/components/features/templates";
import { DrillCard, type Drill as ComponentDrill } from "@/components/features/drills";
import { useTemplate } from "@/hooks/useTemplates";
import { AuthProvider } from "@/providers";
import type { TemplateSection, TemplateItem } from "@/lib/models/Template";
import {
	CATEGORY_SEGMENT_COLORS,
	INTENSITY_SEGMENT_COLORS,
	CATEGORY_PILL_COLORS,
	INTENSITY_PILL_COLORS,
	CATEGORY_LABELS,
	INTENSITY_LABELS,
} from "@/components/features/training/colors";
import {
	Clock,
	Eye,
	EyeOff,
	User,
	BookOpen,
	ChevronDown,
	Layers,
	Zap,
} from "lucide-react";

const SECTION_COLORS = [
	{ color: "#FF7D00", line: "#FF7D00" },
	{ color: "#29757A", line: "#29757A" },
	{ color: "#2E5A88", line: "#2E5A88" },
	{ color: "#D99100", line: "#D99100" },
	{ color: "#4A7A45", line: "#4A7A45" },
	{ color: "#BE3F23", line: "#BE3F23" },
];

export default function PublicTemplatePage() {
	return (
		<AuthProvider>
			<TemplateDetailContent />
		</AuthProvider>
	);
}

function TemplateDetailContent() {
	const params = useParams();
	const templateId = params.id as string;

	const { data: template, isLoading, error } = useTemplate(templateId);

	const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
	const [timelineView, setTimelineView] = useState<"categories" | "intensity">("categories");
	const commentsRef = useRef<HTMLDivElement>(null);

	const handleCommentsClick = () => {
		commentsRef.current?.scrollIntoView({ behavior: "smooth" });
	};

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

	const sectionsWithItems = useMemo(() => {
		if (!template) return [];
		return (template.sections?.map((section) => ({
			...section,
			items: template.items?.filter((item) => item.sectionId === section.id).sort((a, b) => a.order - b.order) || [],
		})) || []).sort((a, b) => a.order - b.order);
	}, [template]);

	const unassignedItems = useMemo(() => {
		if (!template) return [];
		return template.items?.filter((item) => !item.sectionId).sort((a, b) => a.order - b.order) || [];
	}, [template]);

	const allItemsInOrder = useMemo(() => {
		const items: (TemplateItem & { sectionIndex: number })[] = [];
		sectionsWithItems.forEach((section, sIdx) => {
			section.items.forEach((item) => {
				items.push({ ...item, sectionIndex: sIdx });
			});
		});
		unassignedItems.forEach((item) => {
			items.push({ ...item, sectionIndex: -1 });
		});
		return items;
	}, [sectionsWithItems, unassignedItems]);

	const categoryDistribution = useMemo(() => {
		const dist: Record<string, number> = {};
		allItemsInOrder.forEach((item) => {
			const cat = item.drill?.category || "Unknown";
			dist[cat] = (dist[cat] || 0) + (item.duration || 0);
		});
		return Object.entries(dist).sort((a, b) => b[1] - a[1]);
	}, [allItemsInOrder]);

	const intensityDistribution = useMemo(() => {
		const dist: Record<string, number> = {};
		allItemsInOrder.forEach((item) => {
			const int = item.drill?.intensity || "Medium";
			dist[int] = (dist[int] || 0) + (item.duration || 0);
		});
		return Object.entries(dist).sort((a, b) => b[1] - a[1]);
	}, [allItemsInOrder]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader size="lg" />
			</div>
		);
	}

	if (error || !template) {
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-4">
				<p className="text-error">Training plan not found.</p>
			</div>
		);
	}

	const authorName = template.author?.firstName && template.author?.lastName
		? `${template.author.firstName} ${template.author.lastName}`
		: template.author?.firstName || template.author?.lastName || null;

	const totalDuration = template.totalDuration || 0;

	const getCumulativeTime = (sectionIndex: number): number => {
		let time = 0;
		for (let i = 0; i < sectionIndex; i++) {
			time += sectionsWithItems[i]?.items.reduce((sum, item) => sum + (item.duration || 0), 0) || 0;
		}
		return time;
	};

	return (
		<div className="flex flex-col gap-6 max-w-[1200px] mx-auto px-4 py-8">
			{/* Header Card */}
			<div className="bg-surface border border-border rounded-2xl p-6">
				<div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
					<div className="flex items-center gap-4 flex-1">
						<Avatar size="lg" className="size-12 shrink-0">
							{template.author?.avatarUrl ? (
								<AvatarImage src={template.author.avatarUrl} alt={authorName || ""} />
							) : template.clubLogoUrl ? (
								<AvatarImage src={template.clubLogoUrl} alt={template.clubName || ""} />
							) : null}
							<AvatarFallback className="text-base font-semibold bg-gradient-to-br from-accent to-teal-600 text-white">
								{authorName ? authorName.split(" ").map(n => n[0]).join("") : <User size={18} />}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
							<div className="text-sm text-muted-foreground mt-0.5">
								{template.clubName ? (
									<span>by {template.clubName}</span>
								) : authorName ? (
									<span>by {authorName}</span>
								) : null}
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						<Badge
							color={template.visibility === "Public" ? "info" : "neutral"}
							variant="soft"
							size="md"
							icon={template.visibility === "Public" ? <Eye size={14} /> : <EyeOff size={14} />}>
							{template.visibility}
						</Badge>
						<Badge
							variant="soft"
							size="md"
							color={template.level === "Beginner" ? "success" : template.level === "Advanced" ? "error" : "warning"}
							icon={<Zap size={14} />}>
							{template.level}
						</Badge>
					</div>
				</div>

				{template.description && (
					<p className="text-sm text-muted-foreground leading-relaxed mb-4 pb-4 border-b border-border">
						{template.description}
					</p>
				)}

				<div className="flex flex-wrap items-center gap-5 mb-4 text-sm text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<Clock size={14} className="text-accent" />
						{template.totalDuration} minutes
					</span>
					<span className="flex items-center gap-1.5">
						<BookOpen size={14} className="text-accent" />
						{template.drillCount} {template.drillCount === 1 ? "drill" : "drills"}
					</span>
					<span className="flex items-center gap-1.5">
						<Layers size={14} className="text-accent" />
						{template.sectionCount} {template.sectionCount === 1 ? "section" : "sections"}
					</span>
				</div>

				<div className="pt-4 border-t border-border">
					<TemplateInteractionBar
						templateId={template.id}
						likeCount={template.likeCount}
						commentCount={template.commentCount}
						onCommentsClick={handleCommentsClick}
					/>
				</div>
			</div>

			{/* Timeline Card */}
			{allItemsInOrder.length > 0 && totalDuration > 0 && (
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

					{sectionsWithItems.length > 0 && (
						<div className="relative flex mb-1">
							{sectionsWithItems.map((section, idx) => {
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
			)}

			{/* Drills + Side Panel */}
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
				<div className="space-y-6 min-w-0">
					{sectionsWithItems.length === 0 && unassignedItems.length === 0 ? (
						<div className="bg-surface border border-border rounded-2xl p-8 text-center">
							<p className="text-sm text-muted-foreground">No drills added to this training plan yet.</p>
						</div>
					) : (
						<>
							{sectionsWithItems.map((section, sIdx) => {
								const isCollapsed = collapsedSections.has(section.id);
								const sColor = SECTION_COLORS[sIdx % SECTION_COLORS.length];
								const cumulativeTime = getCumulativeTime(sIdx);

								return (
									<div key={section.id} className="flex gap-6">
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

										<div className="flex-1 min-w-0">
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
						</>
					)}
				</div>

				{/* Side Panel */}
				<div className="space-y-4 lg:sticky lg:top-6">
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
												<span className="text-muted-foreground">{dur}m</span>
											</div>
											<div className="h-1.5 bg-card rounded-full overflow-hidden">
												<div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
											</div>
										</div>
									);
								})}
							</div>
						</SideCard>
					)}

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
												<span className="text-muted-foreground">{dur}m</span>
											</div>
											<div className="h-1.5 bg-card rounded-full overflow-hidden">
												<div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
											</div>
										</div>
									);
								})}
							</div>
						</SideCard>
					)}

					{template.skills.length > 0 && (
						<SideCard title="Skills Covered">
							<div className="flex flex-wrap gap-1.5">
								{template.skills.map((skill) => (
									<Badge key={skill} size="xs" color={getSkillBadgeColor(skill)} variant="soft">
										{skill}
									</Badge>
								))}
							</div>
						</SideCard>
					)}
				</div>
			</div>

			{/* Comments */}
			<div ref={commentsRef}>
				<TemplateCommentsSection templateId={template.id} />
			</div>
		</div>
	);
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="bg-surface border border-border rounded-2xl p-4">
			<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
			{children}
		</div>
	);
}

function formatTime(minutes: number): string {
	const m = Math.floor(minutes);
	return `${m}:00`;
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

"use client";

import { Building2, Calendar, CheckSquare, ChevronRight, Gauge, Hash, ListChecks, Percent } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EvaluationExercise } from "@/lib/models/Evaluation";
import { METRIC_TYPE_CONFIG, SKILL_COLORS, getExerciseSkills } from "../types";
import { formatDistanceToNow } from "date-fns";

interface ExerciseListItemProps {
	exercise: EvaluationExercise;
	highlightedSkills?: string[];
}

// Metric type icon mapping
const METRIC_ICONS: Record<string, typeof CheckSquare> = {
	Checkbox: CheckSquare,
	Slider: Gauge,
	Number: Hash,
	Ratio: Percent,
};

export default function ExerciseListItem({ exercise, highlightedSkills = [] }: ExerciseListItemProps) {
	// Extract unique metric types
	const metricTypes = Array.from(new Set(exercise.metrics.map((m) => m.type)));

	// Extract unique skills from metric weights
	const skills = getExerciseSkills(exercise.metrics);

	// Format date
	const createdDate = exercise.createdAt
		? formatDistanceToNow(new Date(exercise.createdAt), { addSuffix: true })
		: null;

	return (
		<Link href={`/dashboard/coaching/evaluations/exercises/${exercise.id}`} className="group block">
			<div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-border hover:bg-hover transition-all">
				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Title */}
					<h3 className="text-base font-semibold text-foreground truncate group-hover:text-accent transition-colors">
						{exercise.name}
					</h3>

					{/* Metadata row: Metric count, Metric types */}
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs">
						{/* Metric count */}
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<ListChecks size={12} />
							<span className="tabular-nums">
								{exercise.metrics.length} metric{exercise.metrics.length !== 1 ? "s" : ""}
							</span>
						</div>

						{/* Divider */}
						{metricTypes.length > 0 && <div className="w-px h-4 bg-foreground/10" />}

						{/* Metric types */}
						{metricTypes.slice(0, 3).map((type) => {
							const config = METRIC_TYPE_CONFIG[type as keyof typeof METRIC_TYPE_CONFIG];
							const Icon = METRIC_ICONS[type];
							return (
								<div key={type} className="flex items-center gap-1.5">
									<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${config.color}`}>
										{Icon && <Icon size={12} />}
										{config.label}
									</span>
								</div>
							);
						})}
						{metricTypes.length > 3 && (
							<span className="text-muted-foreground text-xs">+{metricTypes.length - 3} more</span>
						)}
					</div>

					{/* Skills */}
					{skills.length > 0 && (
						<div className="flex items-center gap-2 mt-2.5">
							<span className="text-xs text-muted-foreground shrink-0">Skills:</span>
							<div className="flex flex-wrap items-center gap-1.5">
								{skills.map((skill) => {
									const isHighlighted = highlightedSkills.includes(skill);
									const colorClass = SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted-foreground";
									return (
										<button
											key={skill}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
											}}
											className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
												isHighlighted
													? "bg-accent/20 text-accent ring-1 ring-accent/50"
													: colorClass
											}`}
										>
											{skill}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* Footer: Created date on left, Club on right */}
					<div className="flex items-end justify-between gap-3 mt-2">
						{/* Left: Created date */}
						{createdDate && (
							<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
								<Calendar size={12} />
								<span>{createdDate}</span>
							</div>
						)}

						{/* Right: Club name if club-scoped */}
						{exercise.clubId && (
							<Link
								href={`/dashboard/clubs/${exercise.clubId}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors group/club"
							>
								<span className="truncate max-w-[100px] group-hover/club:underline">Club</span>
								<Avatar size="sm" className="size-4">
									<AvatarFallback className="text-[8px]">
										<Building2 size={8} />
									</AvatarFallback>
								</Avatar>
							</Link>
						)}
					</div>
				</div>

				{/* Arrow */}
				<div className="hidden sm:flex items-center">
					<ChevronRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
				</div>
			</div>
		</Link>
	);
}

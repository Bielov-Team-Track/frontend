"use client";

import { ClipboardList, ChevronRight, Calendar, FileText, Target } from "lucide-react";
import Link from "next/link";
import { EvaluationPlan } from "@/lib/models/Evaluation";
import { getExerciseSkills, SKILL_COLORS } from "../types";
import { formatDistanceToNow } from "date-fns";

interface PlanListItemProps {
	plan: EvaluationPlan;
}

export default function PlanListItem({ plan }: PlanListItemProps) {
	// Get all unique skills across all exercises
	const allSkills = Array.from(
		new Set(
			plan.items.flatMap((item) =>
				getExerciseSkills(item.exercise.metrics)
			)
		)
	);

	// Total metrics count across all exercises
	const totalMetrics = plan.items.reduce(
		(sum, item) => sum + item.exercise.metrics.length,
		0
	);

	return (
		<Link
			href={`/hub/coaching/evaluations/plans/${plan.id}`}
			className="group block"
		>
			<div className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-border hover:bg-hover transition-all">
				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Title + Exercise count */}
					<div className="flex items-center gap-3">
						<h3 className="text-base font-semibold text-foreground truncate group-hover:text-accent transition-colors">
							{plan.name || "Unnamed Plan"}
						</h3>
						<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium text-violet-400 bg-violet-500/15 shrink-0">
							<ClipboardList size={12} />
							{plan.items.length} {plan.items.length === 1 ? "exercise" : "exercises"}
						</span>
					</div>

					{/* Metadata row: Total metrics, Event, Created date */}
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs">
						{/* Total metrics */}
						{totalMetrics > 0 && (
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<Target size={12} />
								<span className="tabular-nums">{totalMetrics} total metrics</span>
							</div>
						)}

						{/* Event link */}
						{plan.eventId && (
							<Link
								href={`/hub/events/${plan.eventId}`}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
							>
								<FileText size={12} />
								<span className="underline">View Event</span>
							</Link>
						)}

						{/* Divider */}
						{(totalMetrics > 0 || plan.eventId) && plan.createdAt && (
							<div className="w-px h-4 bg-foreground/10" />
						)}

						{/* Created date */}
						{plan.createdAt && (
							<div className="flex items-center gap-1.5 text-muted-foreground">
								<Calendar size={12} />
								<span>{formatDistanceToNow(plan.createdAt, { addSuffix: true })}</span>
							</div>
						)}
					</div>

					{/* Skills */}
					{allSkills.length > 0 && (
						<div className="flex items-center gap-2 mt-2.5">
							<span className="text-xs text-muted-foreground shrink-0">Skills:</span>
							<div className="flex flex-wrap items-center gap-1.5">
								{allSkills.slice(0, 5).map((skill) => (
									<span
										key={skill}
										className={`px-2 py-0.5 rounded-md text-xs font-medium ${SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted-foreground"}`}
									>
										{skill}
									</span>
								))}
								{allSkills.length > 5 && (
									<span className="text-xs text-muted/70">
										+{allSkills.length - 5}
									</span>
								)}
							</div>
						</div>
					)}

					{/* Notes preview */}
					{plan.notes && (
						<p className="text-sm text-muted-foreground line-clamp-1 mt-2">
							{plan.notes}
						</p>
					)}
				</div>

				{/* Arrow */}
				<div className="hidden sm:flex items-center">
					<ChevronRight
						size={18}
						className="text-muted-foreground group-hover:text-foreground transition-colors"
					/>
				</div>
			</div>
		</Link>
	);
}

"use client";

import { ClipboardList, Calendar, FileText, Target } from "lucide-react";
import Link from "next/link";
import { EvaluationPlan } from "@/lib/models/Evaluation";
import { getExerciseSkills, SKILL_COLORS } from "../types";
import { formatDistanceToNow } from "date-fns";

interface PlanCardProps {
	plan: EvaluationPlan;
	onClick?: () => void;
}

export default function PlanCard({ plan, onClick }: PlanCardProps) {
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

	// Get first 3 exercises to display
	const displayExercises = plan.items.slice(0, 3);
	const hasMoreExercises = plan.items.length > 3;

	const handleCardClick = (e: React.MouseEvent) => {
		if (onClick) {
			e.preventDefault();
			onClick();
		}
	};

	return (
		<Link
			href={`/hub/coaching/evaluations/plans/${plan.id}`}
			onClick={handleCardClick}
			className="group block h-full rounded-2xl bg-surface border border-border hover:border-border/80 hover:bg-hover transition-all"
		>
			<div className="p-5 h-full flex flex-col">
				{/* Header: Exercise count badge */}
				<div className="flex items-center justify-between mb-3">
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-violet-400 bg-violet-500/15">
						<ClipboardList size={12} />
						{plan.items.length} {plan.items.length === 1 ? "exercise" : "exercises"}
					</span>
				</div>

				{/* Title */}
				<h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-accent transition-colors">
					{plan.name || "Unnamed Plan"}
				</h3>

				{/* Notes */}
				{plan.notes && (
					<p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
						{plan.notes}
					</p>
				)}

				{/* Spacer to push content to bottom */}
				<div className="flex-1" />

				{/* Exercise list preview */}
				{displayExercises.length > 0 && (
					<div className="mt-3 space-y-1.5">
						{displayExercises.map((item) => (
							<div
								key={item.id}
								className="flex items-center gap-2 text-xs text-muted-foreground"
							>
								<span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">
									{item.order}
								</span>
								<span className="truncate">{item.exercise.name}</span>
								<span className="text-[10px] text-muted/70 shrink-0">
									{item.exercise.metrics.length}m
								</span>
							</div>
						))}
						{hasMoreExercises && (
							<div className="text-xs text-muted/70 pl-6">
								+{plan.items.length - 3} more
							</div>
						)}
					</div>
				)}

				{/* Metrics count */}
				{totalMetrics > 0 && (
					<div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
						<Target size={12} />
						<span>{totalMetrics} total metrics</span>
					</div>
				)}

				{/* Skills summary */}
				{allSkills.length > 0 && (
					<div className="flex items-center gap-2 mt-3">
						<span className="text-xs text-muted-foreground shrink-0">Skills:</span>
						<div className="flex flex-wrap items-center gap-1.5">
							{allSkills.slice(0, 4).map((skill) => (
								<span
									key={skill}
									className={`px-2 py-0.5 rounded-md text-xs font-medium ${SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted"}`}
								>
									{skill}
								</span>
							))}
							{allSkills.length > 4 && (
								<span className="text-xs text-muted/70">
									+{allSkills.length - 4}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Footer: Event + Created date */}
				<div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
					{/* Event link - placeholder for now */}
					{plan.eventId && (
						<Link
							href={`/hub/events/${plan.eventId}`}
							onClick={(e) => e.stopPropagation()}
							className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors group/event"
						>
							<FileText size={12} />
							<span className="truncate max-w-[120px] group-hover/event:underline">
								View Event
							</span>
						</Link>
					)}

					{/* Created date */}
					{plan.createdAt && (
						<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 ml-auto">
							<Calendar size={12} />
							<span>{formatDistanceToNow(plan.createdAt, { addSuffix: true })}</span>
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

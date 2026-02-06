"use client";

import { Building2, Calendar, CheckSquare, Gauge, Hash, ListChecks, Percent } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { EvaluationExercise } from "@/lib/models/Evaluation";
import { METRIC_TYPE_CONFIG, SKILL_COLORS, getExerciseSkills } from "../types";
import { formatDistanceToNow } from "date-fns";

interface ExerciseCardProps {
	exercise: EvaluationExercise;
	onClick?: () => void;
	highlightedSkills?: string[];
}

// Metric type icon mapping
const METRIC_ICONS: Record<string, typeof CheckSquare> = {
	Checkbox: CheckSquare,
	Slider: Gauge,
	Number: Hash,
	Ratio: Percent,
};

export default function ExerciseCard({ exercise, onClick, highlightedSkills = [] }: ExerciseCardProps) {
	const handleCardClick = (e: React.MouseEvent) => {
		if (onClick) {
			e.preventDefault();
			onClick();
		}
	};

	// Extract unique metric types
	const metricTypes = Array.from(new Set(exercise.metrics.map((m) => m.type)));

	// Extract unique skills from metric weights
	const skills = getExerciseSkills(exercise.metrics);

	// Format date
	const createdDate = exercise.createdAt
		? formatDistanceToNow(new Date(exercise.createdAt), { addSuffix: true })
		: null;

	return (
		<Link
			href={`/dashboard/coaching/evaluations/exercises/${exercise.id}`}
			onClick={handleCardClick}
			className="group block h-full rounded-2xl bg-surface border border-border hover:border-border/80 hover:bg-hover transition-all"
		>
			<div className="p-5 h-full flex flex-col">
				{/* Header: Metric count badge */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent/20 text-accent">
							<ListChecks size={12} />
							{exercise.metrics.length} metric{exercise.metrics.length !== 1 ? "s" : ""}
						</span>
					</div>
				</div>

				{/* Title */}
				<h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-accent transition-colors">
					{exercise.name}
				</h3>

				{/* Description */}
				{exercise.description && (
					<p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
						{exercise.description}
					</p>
				)}

				{/* Spacer to push content to bottom */}
				<div className="flex-1" />

				{/* Metric Types */}
				{metricTypes.length > 0 && (
					<div className="flex items-center gap-2 mt-3">
						<span className="text-xs text-muted-foreground shrink-0">Types:</span>
						<div className="flex flex-wrap items-center gap-1.5">
							{metricTypes.map((type) => {
								const config = METRIC_TYPE_CONFIG[type as keyof typeof METRIC_TYPE_CONFIG];
								const Icon = METRIC_ICONS[type];
								return (
									<span
										key={type}
										className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${config.color}`}
									>
										{Icon && <Icon size={10} />}
										{config.label}
									</span>
								);
							})}
						</div>
					</div>
				)}

				{/* Skills */}
				{skills.length > 0 && (
					<div className="flex items-center gap-2 mt-3">
						<span className="text-xs text-muted-foreground shrink-0">Skills:</span>
						<div className="flex flex-wrap items-center gap-1.5">
							{skills.map((skill) => {
								const isHighlighted = highlightedSkills.includes(skill);
								const colorClass = SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "text-muted bg-surface";
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
				<div className="flex items-end justify-between gap-3 mt-3 pt-3 border-t border-border">
					{/* Left: Created date */}
					{createdDate && (
						<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
							<Calendar size={12} />
							<span>{createdDate}</span>
						</div>
					)}

					{/* Right: Club name with avatar if club-scoped */}
					{exercise.clubId ? (
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
					) : null}
				</div>
			</div>
		</Link>
	);
}

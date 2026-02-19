"use client";

import { Check } from "lucide-react";

export interface ExerciseNavItem {
	id: string;
	name: string;
	order: number;
}

export interface ExerciseNavProps {
	exercises: ExerciseNavItem[];
	currentExerciseId: string | null;
	completedExerciseIds: Set<string>;
	onSelectExercise: (exerciseId: string) => void;
}

export default function ExerciseNav({
	exercises,
	currentExerciseId,
	completedExerciseIds,
	onSelectExercise,
}: ExerciseNavProps) {
	if (exercises.length === 0) {
		return null;
	}

	return (
		<div
			className="flex gap-2 overflow-x-auto pb-1 px-1"
			role="tablist"
			aria-label="Exercises"
		>
			{exercises
				.slice()
				.sort((a, b) => a.order - b.order)
				.map((exercise) => {
					const isSelected = exercise.id === currentExerciseId;
					const isCompleted = completedExerciseIds.has(exercise.id);

					return (
						<button
							key={exercise.id}
							type="button"
							role="tab"
							aria-selected={isSelected}
							onClick={() => onSelectExercise(exercise.id)}
							className={[
								"flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7D00]",
								isSelected
									? "bg-[#FF7D00] text-white shadow-sm"
									: isCompleted
									? "bg-success/15 text-success border border-success/30"
									: "bg-surface border border-border text-muted hover:text-white hover:border-border/80 hover:bg-hover",
							].join(" ")}
						>
							{/* Order number */}
							<span
								className={[
									"w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
									isSelected
										? "bg-white/20 text-white"
										: isCompleted
										? "bg-success/20 text-success"
										: "bg-hover text-muted",
								].join(" ")}
							>
								{exercise.order}
							</span>
							{exercise.name}
							{/* Completed checkmark */}
							{isCompleted && !isSelected && (
								<Check size={11} className="text-success shrink-0" strokeWidth={2.5} />
							)}
						</button>
					);
				})}
		</div>
	);
}

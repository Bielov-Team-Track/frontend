"use client";

import { EvaluationPlanItem } from "@/lib/models/Evaluation";
import { getExerciseSkills, SKILL_COLORS } from "../types";
import { ArrowUp, ArrowDown, X, Target } from "lucide-react";

interface PlanExerciseListProps {
	items: EvaluationPlanItem[];
	onReorder?: (itemIds: string[]) => void;
	onRemove?: (itemId: string) => void;
	readonly?: boolean;
}

export default function PlanExerciseList({
	items,
	onReorder,
	onRemove,
	readonly = false,
}: PlanExerciseListProps) {
	// Sort items by order
	const sortedItems = [...items].sort((a, b) => a.order - b.order);

	const handleMoveUp = (index: number) => {
		if (index === 0 || !onReorder) return;

		const newItems = [...sortedItems];
		[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];

		// Update orders and call reorder
		const reorderedIds = newItems.map((item) => item.id);
		onReorder(reorderedIds);
	};

	const handleMoveDown = (index: number) => {
		if (index === sortedItems.length - 1 || !onReorder) return;

		const newItems = [...sortedItems];
		[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

		// Update orders and call reorder
		const reorderedIds = newItems.map((item) => item.id);
		onReorder(reorderedIds);
	};

	if (sortedItems.length === 0) {
		return (
			<div className="p-8 text-center rounded-xl bg-surface border border-border border-dashed">
				<p className="text-sm text-muted-foreground">No exercises in this plan</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{sortedItems.map((item, index) => {
				const skills = getExerciseSkills(item.exercise.metrics);

				return (
					<div
						key={item.id}
						className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border group"
					>
						{/* Order number */}
						<span className="w-8 h-8 rounded-full bg-accent/20 text-accent text-sm font-bold flex items-center justify-center shrink-0">
							{index + 1}
						</span>

						{/* Exercise info */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-white truncate">
									{item.exercise.name}
								</span>
								<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-violet-400 bg-violet-500/15 shrink-0">
									<Target size={10} />
									{item.exercise.metrics.length}
								</span>
							</div>

							{/* Exercise description */}
							{item.exercise.description && (
								<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
									{item.exercise.description}
								</p>
							)}

							{/* Skills */}
							{skills.length > 0 && (
								<div className="flex items-center gap-1.5 mt-1.5">
									{skills.map((skill) => (
										<span
											key={skill}
											className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted"}`}
										>
											{skill}
										</span>
									))}
								</div>
							)}
						</div>

						{/* Action buttons */}
						{!readonly && (
							<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									type="button"
									onClick={() => handleMoveUp(index)}
									disabled={index === 0}
									className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
									title="Move up"
								>
									<ArrowUp size={14} />
								</button>
								<button
									type="button"
									onClick={() => handleMoveDown(index)}
									disabled={index === sortedItems.length - 1}
									className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
									title="Move down"
								>
									<ArrowDown size={14} />
								</button>
								{onRemove && (
									<button
										type="button"
										onClick={() => onRemove(item.id)}
										className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-error transition-colors"
										title="Remove"
									>
										<X size={14} />
									</button>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

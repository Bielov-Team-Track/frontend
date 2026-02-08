"use client";

import { Button } from "@/components";
import { Loader } from "@/components/ui";
import { useEvaluationExercise } from "@/hooks/useEvaluationExercises";
import { useAuth } from "@/providers";
import { ArrowLeft, Building2, CheckSquare, Gauge, Hash, Pencil, Percent } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { METRIC_TYPE_CONFIG, SKILL_COLORS } from "@/components/features/evaluations/types";

// Metric type icon mapping
const METRIC_ICONS: Record<string, typeof CheckSquare> = {
	Checkbox: CheckSquare,
	Slider: Gauge,
	Number: Hash,
	Ratio: Percent,
};

export default function ExerciseDetailPage() {
	const params = useParams();
	const exerciseId = params.id as string;
	const { userProfile } = useAuth();
	const { data: exercise, isLoading, error } = useEvaluationExercise(exerciseId);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader />
			</div>
		);
	}

	if (error || !exercise) {
		notFound();
	}

	const canEdit = userProfile?.id === exercise.createdByUserId;

	// Extract unique skills from all metrics
	const allSkills = Array.from(
		new Set(
			exercise.metrics.flatMap((metric) =>
				metric.skillWeights.map((sw) => sw.skill)
			)
		)
	);

	return (
		<div className="max-w-4xl mx-auto">
			{/* Navigation */}
			<div className="flex items-center justify-between mb-8">
				<Link
					href="/hub/coaching/evaluations/exercises"
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Exercises
				</Link>
				{canEdit && (
					<Button
						variant="ghost"
						color="neutral"
						size="sm"
						leftIcon={<Pencil size={14} />}
						onClick={() => alert("Edit Exercise Modal - Coming Soon")}
					>
						Edit
					</Button>
				)}
			</div>

			{/* Hero Section */}
			<header className="mb-10">
				{/* Metric count indicator */}
				<div className="flex items-center gap-2 mb-3">
					<span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest">
						{exercise.metrics.length} metric{exercise.metrics.length !== 1 ? "s" : ""}
					</span>
				</div>

				{/* Title */}
				<h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-5">
					{exercise.name}
				</h1>

				{/* Description */}
				{exercise.description && (
					<p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
						{exercise.description}
					</p>
				)}

				{/* Club attribution */}
				{exercise.clubId && (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Building2 size={16} className="text-accent" />
						<span>Club Exercise</span>
					</div>
				)}
			</header>

			{/* Skills Summary */}
			{allSkills.length > 0 && (
				<section className="mb-10">
					<h2 className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-4">
						Skills Evaluated
					</h2>
					<div className="flex flex-wrap gap-2">
						{allSkills.map((skill) => (
							<span
								key={skill}
								className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
									SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted-foreground"
								}`}
							>
								{skill}
							</span>
						))}
					</div>
				</section>
			)}

			{/* Metrics Section */}
			<section className="mb-10">
				<h2 className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-5">
					Evaluation Metrics
				</h2>
				<div className="space-y-4">
					{exercise.metrics.map((metric) => {
						const config = METRIC_TYPE_CONFIG[metric.type as keyof typeof METRIC_TYPE_CONFIG];
						const Icon = METRIC_ICONS[metric.type];

						return (
							<div
								key={metric.id}
								className="p-5 rounded-xl bg-surface border border-border"
							>
								{/* Metric Header */}
								<div className="flex items-start gap-3 mb-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1">
											<h3 className="text-base font-semibold text-foreground">
												{metric.name}
											</h3>
											<span
												className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${config?.color || "bg-surface text-muted-foreground"}`}
											>
												{Icon && <Icon size={12} />}
												{config?.label || metric.type}
											</span>
										</div>
										<p className="text-sm text-muted-foreground">
											Max Points: <span className="font-medium text-foreground">{metric.maxPoints}</span>
										</p>
									</div>
								</div>

								{/* Skill Weights */}
								{metric.skillWeights.length > 0 && (
									<div>
										<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
											Skill Distribution
										</h4>
										<div className="space-y-2">
											{metric.skillWeights.map((sw) => (
												<div key={sw.id} className="flex items-center gap-3">
													{/* Skill name */}
													<span
														className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium min-w-[100px] ${
															SKILL_COLORS[sw.skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted-foreground"
														}`}
													>
														{sw.skill}
													</span>

													{/* Progress bar */}
													<div className="flex-1 h-6 bg-background rounded-lg overflow-hidden">
														<div
															className="h-full bg-accent/30 flex items-center justify-center text-xs font-semibold text-foreground"
															style={{ width: `${sw.percentage}%` }}
														>
															{sw.percentage > 15 && `${sw.percentage}%`}
														</div>
													</div>

													{/* Percentage */}
													<span className="text-xs font-semibold text-foreground tabular-nums min-w-[40px] text-right">
														{sw.percentage}%
													</span>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Config (if available) */}
								{metric.config && (
									<div className="mt-4 pt-4 border-t border-border">
										<p className="text-xs text-muted-foreground">
											<span className="font-semibold">Config:</span> {metric.config}
										</p>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</section>

			{/* Metadata */}
			<section className="rounded-xl bg-card/50 border border-border p-6">
				<h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-4">
					Metadata
				</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
					{exercise.createdAt && (
						<div>
							<span className="text-muted-foreground">Created:</span>{" "}
							<span className="text-foreground font-medium">
								{new Date(exercise.createdAt).toLocaleDateString()}
							</span>
						</div>
					)}
					{exercise.updatedAt && (
						<div>
							<span className="text-muted-foreground">Updated:</span>{" "}
							<span className="text-foreground font-medium">
								{new Date(exercise.updatedAt).toLocaleDateString()}
							</span>
						</div>
					)}
					<div>
						<span className="text-muted-foreground">Total Metrics:</span>{" "}
						<span className="text-foreground font-medium">{exercise.metrics.length}</span>
					</div>
					<div>
						<span className="text-muted-foreground">Total Points:</span>{" "}
						<span className="text-foreground font-medium">
							{exercise.metrics.reduce((sum, m) => sum + m.maxPoints, 0)}
						</span>
					</div>
				</div>
			</section>
		</div>
	);
}

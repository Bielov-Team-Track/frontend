"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Button,
	Select,
	Badge,
	Loader,
	EmptyState,
} from "@/components/ui";
import { Calendar, Download, FileText, TrendingUp, Award, ChevronDown } from "lucide-react";
import { useMyEvaluations } from "@/hooks/useEvaluations";

type DateFilter = "all" | "30days" | "90days" | "year";

export default function MyEvaluationsPage() {
	const [dateFilter, setDateFilter] = useState<DateFilter>("all");
	const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);

	// Fetch data from API hook
	const { data: evaluationsData, isLoading, error } = useMyEvaluations();

	const handleExport = () => {
		// TODO: Implement export functionality
		console.log("Exporting evaluations...");
	};

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-400";
		if (score >= 60) return "text-amber-400";
		return "text-red-400";
	};

	const getScoreChange = (current: number, previous?: number) => {
		if (!previous) return null;
		const change = current - previous;
		return {
			value: change,
			color: change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-muted",
			prefix: change > 0 ? "+" : "",
		};
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader />
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<EmptyState
					icon={FileText}
					title="Failed to Load Evaluations"
					description="There was an error loading your evaluations. Please try again later."
				/>
			</div>
		);
	}

	const filteredEvaluations = evaluationsData?.items || [];

	// Calculate average score from skill scores since overallScore is not in the model
	const averageScore = evaluationsData?.items?.length
		? Math.round(
				evaluationsData.items.reduce((sum, e) => {
					const skillScores = e.skillScores || [];
					const avgSkillScore = skillScores.length > 0
						? skillScores.reduce((s, sk) => s + sk.score, 0) / skillScores.length
						: 0;
					return sum + avgSkillScore;
				}, 0) / evaluationsData.items.length
		  )
		: 0;

	return (
		<div className="container mx-auto p-6 space-y-6 max-w-7xl">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">My Evaluations</h1>
					<p className="text-muted mt-1">View your evaluation history and track your progress</p>
				</div>
				<FileText className="w-12 h-12 text-primary" />
			</div>

			{/* Filters and Actions */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<Calendar className="w-5 h-5 text-muted" />
							<Select
								value={dateFilter}
								onChange={(value) => setDateFilter((value as DateFilter) || "all")}
								options={[
									{ value: "all", label: "All Time" },
									{ value: "30days", label: "Last 30 Days" },
									{ value: "90days", label: "Last 90 Days" },
									{ value: "year", label: "This Year" },
								]}
							/>
						</div>
						<Button variant="outline" onClick={handleExport} className="gap-2">
							<Download className="w-4 h-4" />
							Export
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Total Evaluations</p>
								<p className="text-3xl font-bold text-white mt-1">
									{evaluationsData?.totalCount || 0}
								</p>
							</div>
							<FileText className="w-10 h-10 text-blue-400 opacity-50" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Average Score</p>
								<p className="text-3xl font-bold text-white mt-1">{averageScore}</p>
							</div>
							<Award className="w-10 h-10 text-amber-400 opacity-50" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Latest Outcome</p>
								<p className="text-xl font-bold text-white mt-1">
									{evaluationsData?.items?.[0]?.outcome || "N/A"}
								</p>
							</div>
							<TrendingUp className="w-10 h-10 text-green-400 opacity-50" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Evaluations List */}
			<Card>
				<CardHeader>
					<CardTitle>Evaluation History</CardTitle>
					<CardDescription>Detailed records of all your evaluations</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{filteredEvaluations.length === 0 ? (
							<div className="text-center py-8 text-muted">
								<FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p className="text-sm">No evaluations found</p>
							</div>
						) : (
							filteredEvaluations.map((evaluation) => {
								const isExpanded = expandedEvaluation === evaluation.id;

								return (
									<div key={evaluation.id} className="space-y-3">
										{/* Evaluation Summary */}
										<button
											onClick={() =>
												setExpandedEvaluation(isExpanded ? null : evaluation.id)
											}
											className="w-full p-4 rounded-lg bg-surface border border-border hover:bg-hover transition-colors text-left"
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 space-y-2">
													<div className="flex items-center gap-3">
														<h4 className="font-semibold text-white">
															Evaluation {evaluation.id.slice(0, 8)}
														</h4>
														{(() => {
															const avgScore = evaluation.skillScores?.length
																? Math.round(evaluation.skillScores.reduce((s, sk) => s + sk.score, 0) / evaluation.skillScores.length)
																: 0;
															return avgScore > 0 ? (
																<Badge
																	variant="solid"
																	className={getScoreColor(avgScore)}
																>
																	{avgScore}/100
																</Badge>
															) : null;
														})()}
														{evaluation.outcome && (
															<Badge
																variant={
																	evaluation.outcome === "Passed"
																		? "solid"
																		: evaluation.outcome === "Failed"
																		? "solid"
																		: "outline"
																}
																color={
																	evaluation.outcome === "Passed"
																		? "success"
																		: evaluation.outcome === "Failed"
																		? "error"
																		: undefined
																}
															>
																{evaluation.outcome}
															</Badge>
														)}
													</div>
													<div className="flex items-center gap-4 text-sm text-muted">
														{evaluation.createdAt && (
															<span>
																{new Date(evaluation.createdAt).toLocaleDateString()}
															</span>
														)}
													</div>
												</div>
												<ChevronDown
													className={`w-5 h-5 text-muted transition-transform ${
														isExpanded ? "rotate-180" : ""
													}`}
												/>
											</div>
										</button>

										{/* Expanded Details */}
										{isExpanded && (
											<div className="pl-4 pr-4 pb-4 space-y-4">
												{/* Skill Scores */}
												<div className="space-y-3">
													<h5 className="text-sm font-semibold text-white">Skill Scores</h5>
													{evaluation.skillScores && evaluation.skillScores.length > 0 ? (
														<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
															{evaluation.skillScores.map((skill) => (
																<div
																	key={skill.id}
																	className="flex items-center justify-between p-3 rounded-lg bg-surface"
																>
																	<div className="flex flex-col gap-1">
																		<span className="text-sm text-white font-medium">
																			{skill.skill}
																		</span>
																		{skill.level && (
																			<span className="text-xs text-muted">
																				Level: {skill.level}
																			</span>
																		)}
																	</div>
																	<div className="flex items-center gap-2">
																		<span
																			className={`font-semibold ${getScoreColor(
																				skill.score
																			)}`}
																		>
																			{skill.score.toFixed(0)}
																		</span>
																		<span className="text-xs text-muted">
																			({skill.earnedPoints}/{skill.maxPoints})
																		</span>
																	</div>
																</div>
															))}
														</div>
													) : (
														<p className="text-sm text-muted">No skill scores available</p>
													)}
												</div>

												{/* Coach Notes */}
												{evaluation.coachNotes && (
													<div className="space-y-2">
														<h5 className="text-sm font-semibold text-white">Coach Notes</h5>
														<p className="text-sm text-muted leading-relaxed p-3 rounded-lg bg-surface">
															{evaluation.coachNotes}
														</p>
													</div>
												)}
											</div>
										)}
									</div>
								);
							})
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

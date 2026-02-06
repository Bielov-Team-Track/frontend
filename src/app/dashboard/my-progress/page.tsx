"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Loader,
	EmptyState,
} from "@/components/ui";
import { BadgeDisplay, BadgeGrid } from "@/components/features/feedback/BadgeDisplay";
import { SkillProgressChart, SkillChangeIndicator, type SkillTrend } from "@/components/features/feedback/SkillProgressChart";
import { Confetti } from "@/components/features/feedback/Confetti";
import { Award, MessageSquare, TrendingUp, Trophy } from "lucide-react";
import { usePlayerDashboard, useSkillProgress } from "@/hooks/useDashboard";
import { useMyBadges } from "@/hooks/useBadges";

export default function MyProgressPage() {
	const [showConfetti, setShowConfetti] = useState(false);

	// Fetch data from API hooks
	const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = usePlayerDashboard();
	const { data: skillProgressData, isLoading: isSkillProgressLoading } = useSkillProgress();
	const { data: badgesData, isLoading: isBadgesLoading } = useMyBadges();

	// Loading state
	if (isDashboardLoading || isSkillProgressLoading || isBadgesLoading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader />
				</div>
			</div>
		);
	}

	// Error state
	if (dashboardError) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<EmptyState
					icon={Award}
					title="Failed to Load Progress"
					description="There was an error loading your progress data. Please try again later."
				/>
			</div>
		);
	}

	// No data state
	if (!dashboardData) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<EmptyState
					icon={Trophy}
					title="No Progress Data"
					description="Start participating in events to track your progress."
				/>
			</div>
		);
	}

	const recentBadges = badgesData?.items?.slice(0, 3).map((b) => b.badgeType) || [];

	return (
		<div className="container mx-auto p-6 space-y-6 max-w-7xl">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">My Progress</h1>
					<p className="text-muted mt-1">Track your volleyball skill development and feedback</p>
				</div>
				<Trophy className="w-12 h-12 text-primary" />
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Recent Evaluations</p>
								<p className="text-3xl font-bold text-white mt-1">
									{dashboardData.recentEvaluations?.length || 0}
								</p>
								<p className="text-xs text-muted mt-1">Latest assessments</p>
							</div>
							<div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
								<Award className="w-8 h-8 text-primary" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Feedback Received</p>
								<p className="text-3xl font-bold text-white mt-1">
									{dashboardData.recentFeedback?.length || 0}
								</p>
								<p className="text-xs text-muted mt-1">Recent items</p>
							</div>
							<div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center">
								<MessageSquare className="w-8 h-8 text-blue-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Badges Earned</p>
								<p className="text-3xl font-bold text-white mt-1">
									{badgesData?.totalCount || 0}
								</p>
								<p className="text-xs text-muted mt-1">View all badges</p>
							</div>
							<div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
								<Trophy className="w-8 h-8 text-amber-400" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Skill Progress Chart */}
			{skillProgressData?.trends && skillProgressData.trends.length > 0 ? (
				<SkillProgressChart trends={skillProgressData.trends} />
			) : (
				<Card>
					<CardContent className="py-12">
						<EmptyState
							icon={TrendingUp}
							title="No Skill Progress Data"
							description="Participate in more evaluated events to track your skill progress."
						/>
					</CardContent>
				</Card>
			)}

			{/* Two Column Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Feedback */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Feedback</CardTitle>
						<CardDescription>Latest praise and suggestions from your coaches</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{!dashboardData.recentFeedback || dashboardData.recentFeedback.length === 0 ? (
								<div className="text-center py-8 text-muted">
									<MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
									<p className="text-sm">No feedback yet</p>
								</div>
							) : (
								dashboardData.recentFeedback.map((feedback) => (
									<div
										key={feedback.id}
										className="p-4 rounded-lg bg-surface border border-border space-y-2"
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex items-center gap-2">
												{feedback.hasPraise ? (
													<Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
												) : (
													<TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
												)}
												<span className="text-sm font-medium text-white">
													{feedback.hasPraise ? "Praise" : "Improvement Points"}
												</span>
											</div>
											<span className="text-xs text-muted flex-shrink-0">
												{feedback.date ? new Date(feedback.date).toLocaleDateString() : "N/A"}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm text-muted">
											<span>{feedback.eventName || "Event"}</span>
											{feedback.improvementPointsCount > 0 && (
												<>
													<span>•</span>
													<span className="px-2 py-1 rounded-full bg-surface text-white text-xs">
														{feedback.improvementPointsCount} improvement points
													</span>
												</>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</CardContent>
				</Card>

				{/* Recent Badges */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Badges</CardTitle>
						<CardDescription>Achievements unlocked this month</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{recentBadges.length === 0 ? (
								<div className="text-center py-8 text-muted">
									<Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
									<p className="text-sm">No badges earned yet</p>
								</div>
							) : (
								<>
									<BadgeGrid badges={recentBadges as any} size="lg" className="justify-center" />
									<button
										onClick={() => setShowConfetti(true)}
										className="w-full px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
									>
										View All Badges
									</button>
								</>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Skill Progress Details */}
			{skillProgressData?.trends && skillProgressData.trends.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Current Skill Levels</CardTitle>
						<CardDescription>Your latest skill levels with progress indicators</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{skillProgressData.trends.map((trend) => (
								<SkillChangeIndicator
									key={trend.skill}
									skillName={trend.skill}
									currentScore={trend.currentLevel || 0}
									previousScore={trend.previousLevel}
								/>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Recent Evaluations */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Evaluations</CardTitle>
					<CardDescription>Latest coach evaluations from your events</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{!dashboardData.recentEvaluations || dashboardData.recentEvaluations.length === 0 ? (
							<div className="text-center py-8 text-muted">
								<Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p className="text-sm">No evaluations yet</p>
							</div>
						) : (
							dashboardData.recentEvaluations.map((evaluation) => (
								<div
									key={evaluation.id}
									className="p-4 rounded-lg bg-surface border border-border hover:bg-hover transition-colors cursor-pointer"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-3">
												<h4 className="font-semibold text-white">{evaluation.eventName || "Event"}</h4>
												{evaluation.averageScore && (
													<span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
														{Math.round(evaluation.averageScore)}/100
													</span>
												)}
												{evaluation.outcome && (
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${
														evaluation.outcome === "Passed"
															? "bg-green-500/10 text-green-400"
															: evaluation.outcome === "Failed"
															? "bg-red-500/10 text-red-400"
															: "bg-amber-500/10 text-amber-400"
													}`}>
														{evaluation.outcome}
													</span>
												)}
											</div>
											<div className="flex items-center gap-4 text-xs text-muted">
												<span>{evaluation.date ? new Date(evaluation.date).toLocaleDateString() : "N/A"}</span>
											</div>
											{evaluation.highestSkillLevel && (
												<div className="flex items-center gap-2 text-sm">
													<span className="text-muted">Highest Skill Level:</span>
													<span className="text-green-400 font-medium">{evaluation.highestSkillLevel}</span>
												</div>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			{/* Confetti Effect */}
			<Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
		</div>
	);
}

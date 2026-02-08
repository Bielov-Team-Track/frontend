"use client";

import { EmptyState, Loader } from "@/components";
import SkillRadarChart from "@/components/features/player-development/SkillRadarChart";
import { usePlayerDashboard } from "@/hooks/useDashboard";
import { BadgeType, BADGE_METADATA } from "@/lib/models/Evaluation";
import { Award, Dumbbell, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function PlayerDevelopmentPage() {
	const { data: dashboard, isLoading } = usePlayerDashboard();

	if (isLoading) {
		return <Loader />;
	}

	if (!dashboard) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-foreground">My Development</h1>
				</div>
				<EmptyState
					icon={TrendingUp}
					title="No Data Available"
					description="Your development data will appear here once you participate in events and receive evaluations."
				/>
			</div>
		);
	}

	const hasSkillData = dashboard.skillProgress?.trends && dashboard.skillProgress.trends.length > 0;
	const hasBadges = dashboard.badges && dashboard.badges.length > 0;
	const hasDrills = dashboard.assignedDrills && dashboard.assignedDrills.length > 0;
	const hasFeedback = dashboard.recentFeedback && dashboard.recentFeedback.length > 0;

	// Get all badge types with earned status
	const allBadgeTypes = Object.values(BadgeType);
	const earnedBadgeTypes = new Set(dashboard.badges.map((b) => b.type));

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">My Development</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left Column */}
				<div className="lg:col-span-4 space-y-6">
					{/* Skill Radar Chart */}
					{hasSkillData && (
						<div className="rounded-xl bg-surface/80 backdrop-blur-sm shadow-sm p-5">
							<h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-primary" />
								Skill Levels
							</h2>
							<SkillRadarChart trends={dashboard.skillProgress!.trends} size={280} />
						</div>
					)}

					{/* Badge Collection */}
					<div className="rounded-xl bg-surface/80 backdrop-blur-sm shadow-sm p-5">
						<h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
							<Award className="h-4 w-4 text-primary" />
							Badge Collection
						</h2>
						{hasBadges ? (
							<div className="grid grid-cols-2 gap-3">
								{allBadgeTypes.map((badgeType) => {
									const isEarned = earnedBadgeTypes.has(badgeType);
									const metadata = BADGE_METADATA[badgeType];
									const earnedBadge = dashboard.badges.find((b) => b.type === badgeType);

									return (
										<div
											key={badgeType}
											className={`rounded-lg border p-3 text-center transition-all ${
												isEarned
													? "bg-primary/5 border-primary/20"
													: "bg-muted/30 border-border opacity-40 grayscale"
											}`}
										>
											<div className="text-2xl mb-1">{metadata.icon}</div>
											<div className="text-xs font-medium text-foreground">{metadata.name}</div>
											{isEarned && earnedBadge && (
												<div className="text-[10px] text-muted-foreground mt-1">
													{earnedBadge.awardedDate.toLocaleDateString()}
												</div>
											)}
										</div>
									);
								})}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground text-sm">
								<Award className="h-8 w-8 mx-auto mb-2 opacity-40" />
								<p>No badges earned yet</p>
							</div>
						)}
					</div>

					{/* Active Drills */}
					<div className="rounded-xl bg-surface/80 backdrop-blur-sm shadow-sm p-5">
						<h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
							<Dumbbell className="h-4 w-4 text-primary" />
							Active Drills
						</h2>
						{hasDrills ? (
							<div className="space-y-3">
								{dashboard.assignedDrills.slice(0, 5).map((drill) => (
									<div key={drill.drillId} className="border border-border rounded-lg p-3">
										<div className="font-medium text-sm text-foreground mb-1">{drill.drillName}</div>
										{drill.coachNote && (
											<p className="text-xs text-muted-foreground mb-2">{drill.coachNote}</p>
										)}
										<div className="text-[10px] text-muted-foreground">
											Assigned {drill.assignedDate.toLocaleDateString()}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground text-sm">
								<Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-40" />
								<p>No drills assigned</p>
							</div>
						)}
					</div>
				</div>

				{/* Right Column */}
				<div className="lg:col-span-8 space-y-6">
					{/* TODO: Improvement Themes Chart - requires backend themes endpoint */}
					{/* <div className="rounded-xl bg-surface/80 backdrop-blur-sm shadow-sm p-5">
						<h2 className="text-sm font-semibold text-foreground mb-4">Improvement Themes</h2>
						<ImprovementThemesChart />
					</div> */}

					{/* Recent Feedback */}
					<div className="rounded-xl bg-surface/80 backdrop-blur-sm shadow-sm p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-primary" />
								Recent Feedback
							</h2>
							{hasFeedback && dashboard.recentFeedback.length > 3 && (
								<Link
									href="/hub/player/development/feedback"
									className="text-xs text-primary hover:underline"
								>
									View All →
								</Link>
							)}
						</div>
						{hasFeedback ? (
							<div className="space-y-3">
								{dashboard.recentFeedback.slice(0, 5).map((feedback) => (
									<div
										key={feedback.id}
										className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
									>
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<div className="font-medium text-sm text-foreground mb-1">
													{feedback.eventName || "Event Feedback"}
												</div>
												<div className="flex items-center gap-3 text-xs text-muted-foreground">
													{feedback.date && (
														<span>{feedback.date.toLocaleDateString()}</span>
													)}
													{feedback.hasPraise && (
														<span className="inline-flex items-center gap-1 text-primary">
															<Award className="h-3 w-3" />
															Praise
														</span>
													)}
													{feedback.improvementPointsCount > 0 && (
														<span className="inline-flex items-center gap-1">
															<TrendingUp className="h-3 w-3" />
															{feedback.improvementPointsCount} improvement
															{feedback.improvementPointsCount !== 1 ? "s" : ""}
														</span>
													)}
												</div>
											</div>
											<Link
												href={`/hub/player/development/feedback?id=${feedback.id}`}
												className="text-xs text-primary hover:underline whitespace-nowrap"
											>
												View Details →
											</Link>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-12 text-muted-foreground text-sm">
								<MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-40" />
								<p className="font-medium mb-1">No Feedback Yet</p>
								<p className="text-xs">
									Participate in events to receive feedback from coaches
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

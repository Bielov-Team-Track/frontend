"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Button,
	Badge,
	Loader,
	EmptyState,
} from "@/components/ui";
import {
	Award,
	Calendar,
	CheckCircle2,
	Clock,
	FileText,
	TrendingUp,
	Users,
	ClipboardList,
} from "lucide-react";
import { useCoachDashboard } from "@/hooks/useDashboard";

export default function CoachDashboardPage() {
	const router = useRouter();
	const [selectedTab, setSelectedTab] = useState<"pending" | "recent">("pending");

	// Fetch data from API hook
	const { data: coachData, isLoading, error } = useCoachDashboard();

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
					icon={ClipboardList}
					title="Failed to Load Dashboard"
					description="There was an error loading your coach dashboard. Please try again later."
				/>
			</div>
		);
	}

	// No data state
	if (!coachData) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<EmptyState
					icon={ClipboardList}
					title="No Dashboard Data"
					description="Start organizing events to track your coaching activities."
				/>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6 max-w-7xl">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">Coach Dashboard</h1>
					<p className="text-muted mt-1">Manage evaluations and track team progress</p>
				</div>
				<ClipboardList className="w-12 h-12 text-primary" />
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-2">
							<p className="text-sm text-muted">Total Evaluations</p>
							<div className="flex items-baseline gap-2">
								<p className="text-2xl font-bold text-white">
									{coachData.stats.totalEvaluationsGiven || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-2">
							<p className="text-sm text-muted">Players This Month</p>
							<div className="flex items-baseline gap-2">
								<p className="text-2xl font-bold text-white">
									{coachData.stats.playersEvaluatedThisMonth || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-2">
							<p className="text-sm text-muted">Total Feedback</p>
							<div className="flex items-baseline gap-2">
								<p className="text-2xl font-bold text-white">
									{coachData.stats.totalFeedbackGiven || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="space-y-2">
							<p className="text-sm text-muted">Praise This Month</p>
							<div className="flex items-baseline gap-2">
								<p className="text-2xl font-bold text-white">
									{coachData.stats.praiseGivenThisMonth || 0}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Common tasks and shortcuts</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Button variant="default" className="justify-start h-auto py-4">
							<div className="flex items-center gap-3 w-full">
								<ClipboardList className="w-5 h-5" />
								<div className="text-left">
									<p className="font-semibold">Create Evaluation</p>
									<p className="text-xs opacity-80">Start a new player assessment</p>
								</div>
							</div>
						</Button>
						<Button variant="outline" className="justify-start h-auto py-4">
							<div className="flex items-center gap-3 w-full">
								<FileText className="w-5 h-5" />
								<div className="text-left">
									<p className="font-semibold">View Reports</p>
									<p className="text-xs opacity-80">Team progress and analytics</p>
								</div>
							</div>
						</Button>
						<Button variant="outline" className="justify-start h-auto py-4">
							<div className="flex items-center gap-3 w-full">
								<Award className="w-5 h-5" />
								<div className="text-left">
									<p className="font-semibold">Give Praise</p>
									<p className="text-xs opacity-80">Send feedback to players</p>
								</div>
							</div>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Pending Evaluations */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="w-5 h-5 text-amber-400" />
						Pending Evaluations
					</CardTitle>
					<CardDescription>Events waiting for player evaluations</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{!coachData.pendingEvaluations || coachData.pendingEvaluations.length === 0 ? (
							<div className="text-center py-8 text-muted">
								<CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p className="text-sm">All caught up! No pending evaluations.</p>
							</div>
						) : (
							coachData.pendingEvaluations.map((evaluation) => {
								const isUrgent = evaluation.pendingCount > 5;

								return (
									<div
										key={evaluation.eventId}
										className="p-4 rounded-lg bg-surface border border-border hover:bg-hover transition-colors cursor-pointer"
										onClick={() => router.push(`/hub/events/${evaluation.eventId}/evaluate`)}
									>
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-3">
													<h4 className="font-semibold text-white">{evaluation.eventName}</h4>
													{isUrgent && (
														<Badge variant="solid" color="error" className="text-xs">
															{evaluation.pendingCount} pending
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-4 text-sm text-muted">
													<div className="flex items-center gap-1">
														<Calendar className="w-4 h-4" />
														{new Date(evaluation.eventDate).toLocaleDateString()}
													</div>
													<div className="flex items-center gap-1">
														<Users className="w-4 h-4" />
														{evaluation.evaluatedCount}/{evaluation.totalPlayers} completed
													</div>
													<div className="flex items-center gap-1">
														<Clock className="w-4 h-4" />
														{evaluation.pendingCount} remaining
													</div>
												</div>
											</div>
											<Button size="sm" variant="default">
												Start Evaluation
											</Button>
										</div>
									</div>
								);
							})
						)}
					</div>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle2 className="w-5 h-5 text-green-400" />
						Recent Activity
					</CardTitle>
					<CardDescription>Your latest coaching actions</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{!coachData.recentActivity || coachData.recentActivity.length === 0 ? (
							<div className="text-center py-8 text-muted">
								<FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
								<p className="text-sm">No recent activity</p>
							</div>
						) : (
							<>
								{coachData.recentActivity.map((activity) => (
									<div
										key={activity.entityId}
										className="p-4 rounded-lg bg-surface border border-border hover:bg-hover transition-colors cursor-pointer"
									>
										<div className="flex items-center justify-between gap-4">
											<div className="flex-1 space-y-1">
												<div className="flex items-center gap-3">
													<h4 className="font-semibold text-white">{activity.playerName}</h4>
													<span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
														{activity.type}
													</span>
												</div>
												<div className="flex items-center gap-4 text-sm text-muted">
													{activity.eventName && (
														<>
															<span>{activity.eventName}</span>
															<span>•</span>
														</>
													)}
													<span>{new Date(activity.date).toLocaleDateString()}</span>
												</div>
												{activity.summary && (
													<p className="text-sm text-muted mt-1">{activity.summary}</p>
												)}
											</div>
											<Button size="sm" variant="ghost">
												View Details
											</Button>
										</div>
									</div>
								))}
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Team Statistics */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-blue-400" />
						Team Performance Trends
					</CardTitle>
					<CardDescription>Aggregated skill improvements over time</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-64 flex items-center justify-center bg-surface rounded-lg border border-dashed border-border">
						<div className="text-center space-y-2">
							<TrendingUp className="w-12 h-12 text-muted mx-auto" />
							<p className="text-sm text-muted">Team analytics chart</p>
							<p className="text-xs text-muted">Will show skill trends across all players</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Select,
	Badge as BadgeComponent,
	Loader,
	EmptyState,
} from "@/components/ui";
import { BadgeDisplay, BadgeGrid, BADGE_INFO, type BadgeType } from "@/components/features/feedback/BadgeDisplay";
import { Confetti } from "@/components/features/feedback/Confetti";
import { Award, Filter, Trophy, Star } from "lucide-react";
import { useMyBadges, useMyBadgeStats } from "@/hooks/useBadges";

const allBadgeTypes: BadgeType[] = [
	"FirstEvent",
	"EventOrganizer",
	"TeamPlayer",
	"MVP",
	"Consistent",
	"Champion",
	"SocialButterfly",
	"EarlyBird",
];

type BadgeFilter = "all" | "earned" | "locked";

export default function BadgesPage() {
	const [filter, setFilter] = useState<BadgeFilter>("all");
	const [showConfetti, setShowConfetti] = useState(false);
	const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

	// Fetch data from API hooks
	const { data: badgesData, isLoading: isBadgesLoading, error: badgesError } = useMyBadges();
	const { data: statsData, isLoading: isStatsLoading } = useMyBadgeStats();

	// Auto-show confetti for new badges on mount (disabled - isNew not in model)
	useEffect(() => {
		// Note: isNew is not in PlayerBadge model, so we can't detect new badges
		// Could check if createdAt is within last day as alternative
		const hasNewBadges = badgesData?.items?.some((b) => {
			if (!b.createdAt) return false;
			const daysSinceCreated = (Date.now() - b.createdAt.getTime()) / (1000 * 60 * 60 * 24);
			return daysSinceCreated < 1;
		});
		if (hasNewBadges) {
			setShowConfetti(true);
		}
	}, [badgesData]);

	// Loading state
	if (isBadgesLoading || isStatsLoading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader />
				</div>
			</div>
		);
	}

	// Error state
	if (badgesError) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<EmptyState
					icon={Trophy}
					title="Failed to Load Badges"
					description="There was an error loading your badges. Please try again later."
				/>
			</div>
		);
	}

	const earnedBadges = badgesData?.items || [];
	const earnedBadgeTypes = new Set(earnedBadges.map((b) => b.badgeType));
	const lockedBadgeTypes = allBadgeTypes.filter((type) => !earnedBadgeTypes.has(type));

	const getFilteredBadges = (): BadgeType[] => {
		switch (filter) {
			case "earned":
				return Array.from(earnedBadgeTypes) as BadgeType[];
			case "locked":
				return lockedBadgeTypes;
			default:
				return allBadgeTypes;
		}
	};

	const getBadgeEarnedInfo = (badgeType: BadgeType) => {
		return earnedBadges.find((b) => b.badgeType === badgeType);
	};

	const filteredBadges = getFilteredBadges();

	return (
		<div className="container mx-auto p-6 space-y-6 max-w-7xl">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white">Badge Collection</h1>
					<p className="text-muted mt-1">Unlock achievements and track your volleyball journey</p>
				</div>
				<Trophy className="w-12 h-12 text-primary" />
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Total Badges</p>
								<p className="text-3xl font-bold text-white mt-1">
									{statsData?.totalBadges || badgesData?.totalCount || 0}
								</p>
							</div>
							<Award className="w-10 h-10 text-amber-400 opacity-50" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Unique Types</p>
								<p className="text-3xl font-bold text-green-400 mt-1">
									{earnedBadgeTypes.size}
								</p>
							</div>
							<Trophy className="w-10 h-10 text-green-400 opacity-50" />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted">Completion</p>
								<p className="text-3xl font-bold text-white mt-1">
									{Math.round((earnedBadgeTypes.size / allBadgeTypes.length) * 100)}%
								</p>
							</div>
							<Star className="w-10 h-10 text-primary opacity-50" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filter */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-3">
						<Filter className="w-5 h-5 text-muted" />
						<Select
							value={filter}
							onChange={(value) => setFilter((value as BadgeFilter) || "all")}
							options={[
								{ value: "all", label: `All Badges (${allBadgeTypes.length})` },
								{ value: "earned", label: `Earned (${earnedBadgeTypes.size})` },
								{ value: "locked", label: `Locked (${lockedBadgeTypes.length})` },
							]}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Badge Grid */}
			<Card>
				<CardHeader>
					<CardTitle>
						{filter === "all"
							? "All Badges"
							: filter === "earned"
							? "Earned Badges"
							: "Locked Badges"}
					</CardTitle>
					<CardDescription>
						{filter === "all"
							? "Your complete badge collection"
							: filter === "earned"
							? "Achievements you've unlocked"
							: "Badges waiting to be earned"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{filteredBadges.map((badgeType) => {
							const earnedInfo = getBadgeEarnedInfo(badgeType);
							const isEarned = !!earnedInfo;
							const badgeInfo = BADGE_INFO[badgeType];

							return (
								<div
									key={badgeType}
									onClick={() => setSelectedBadge(badgeType)}
									className="cursor-pointer"
								>
									<div
										className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
											isEarned
												? "bg-surface border-border"
												: "bg-surface border-border opacity-40"
										}`}
									>
										<div className="flex flex-col items-center space-y-3">
											{/* Badge Display */}
											<div className="relative">
												<BadgeDisplay
													badgeType={badgeType}
													size="lg"
													showTooltip={false}
													className={!isEarned ? "grayscale" : ""}
												/>
												{earnedInfo?.createdAt && (
													(() => {
														const daysSinceCreated = (Date.now() - earnedInfo.createdAt.getTime()) / (1000 * 60 * 60 * 24);
														return daysSinceCreated < 7 ? (
															<div className="absolute -top-2 -right-2">
																<BadgeComponent
																	variant="solid"
																	color="primary"
																	className="text-xs px-2 py-0.5"
																>
																	NEW
																</BadgeComponent>
															</div>
														) : null;
													})()
												)}
											</div>

											{/* Badge Info */}
											<div className="text-center space-y-1">
												<h4 className="font-semibold text-white text-sm">
													{badgeInfo.name}
												</h4>
												<p className="text-xs text-muted leading-relaxed">
													{badgeInfo.description}
												</p>
												{isEarned && earnedInfo && earnedInfo.createdAt && (
													<p className="text-xs text-muted pt-1">
														Earned{" "}
														{new Date(earnedInfo.createdAt).toLocaleDateString()}
													</p>
												)}
											</div>

											{/* Lock Indicator */}
											{!isEarned && (
												<div className="mt-2 text-xs text-muted flex items-center gap-1">
													<span>🔒</span>
													<span>Locked</span>
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{filteredBadges.length === 0 && (
						<div className="text-center py-12 text-muted">
							<Award className="w-16 h-16 mx-auto mb-3 opacity-50" />
							<p>No badges found</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Selected Badge Details (Modal-like) */}
			{selectedBadge && (
				<Card>
					<CardHeader>
						<CardTitle>Badge Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row items-center gap-6">
							<BadgeDisplay badgeType={selectedBadge} size="lg" showTooltip={false} />
							<div className="flex-1 space-y-3">
								<div>
									<h3 className="text-xl font-bold text-white">
										{BADGE_INFO[selectedBadge].name}
									</h3>
									<p className="text-sm text-muted mt-1">
										{BADGE_INFO[selectedBadge].description}
									</p>
								</div>

								{getBadgeEarnedInfo(selectedBadge) ? (
									<div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
										<p className="text-sm font-medium text-green-400">Unlocked!</p>
										{getBadgeEarnedInfo(selectedBadge)!.createdAt && (
											<p className="text-xs text-muted mt-1">
												Earned on{" "}
												{new Date(
													getBadgeEarnedInfo(selectedBadge)!.createdAt!
												).toLocaleDateString()}
											</p>
										)}
										{getBadgeEarnedInfo(selectedBadge)!.eventId && (
											<p className="text-xs text-muted mt-1">
												Event ID: {getBadgeEarnedInfo(selectedBadge)!.eventId}
											</p>
										)}
									</div>
								) : (
									<div className="p-4 rounded-lg bg-surface border border-border">
										<p className="text-sm font-medium text-muted">Not yet unlocked</p>
										<p className="text-xs text-muted mt-1">
											Keep playing to earn this badge!
										</p>
									</div>
								)}

								<button
									onClick={() => setSelectedBadge(null)}
									className="text-sm text-primary hover:underline"
								>
									Close
								</button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Confetti Effect */}
			<Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
		</div>
	);
}

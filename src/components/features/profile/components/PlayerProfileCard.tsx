"use client";

import { Avatar, Button } from "@/components";
import { PlayerProfile, VolleyballPosition } from "@/lib/models/User";
import { cn } from "@/lib/utils";
import {
	Bell,
	Mail,
	MapPin,
	Calendar,
	Trophy,
	Circle,
	Ruler,
	ArrowUp,
	Hand,
} from "lucide-react";
import SkillRatingBar from "./SkillRatingBar";
import StatCard from "./StatCard";
import { BadgeGrid } from "./BadgeDisplay";

interface PlayerProfileCardProps {
	player: PlayerProfile;
	isOwnProfile?: boolean;
	onMessage?: () => void;
	onFollow?: () => void;
	onUnfollow?: () => void;
}

const positionLabels: Record<VolleyballPosition, string> = {
	setter: "Setter",
	outside_hitter: "Outside Hitter",
	opposite: "Opposite",
	middle_blocker: "Middle Blocker",
	libero: "Libero",
	defensive_specialist: "Defensive Specialist",
};

const experienceLevelColors = {
	beginner: "bg-success/20 text-success border-success/30",
	intermediate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
	professional: "bg-warning/20 text-warning border-warning/30",
};

const PlayerProfileCard = ({
	player,
	isOwnProfile = false,
	onMessage,
	onFollow,
	onUnfollow,
}: PlayerProfileCardProps) => {
	const winRate =
		player.stats.gamesPlayed > 0
			? Math.round((player.stats.gamesWon / player.stats.gamesPlayed) * 100)
			: 0;

	return (
		<div className="w-full">
			{/* Header Section */}
			<div className="bg-linear-to-br from-primary/20 via-background to-background rounded-t-2xl p-6 md:p-8">
				<div className="flex flex-col md:flex-row gap-6 items-start">
					{/* Avatar */}
					<div className="relative">
						<Avatar profile={player} size="large" />
						{player.experienceLevel && (
							<div
								className={cn(
									"absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold border capitalize",
									experienceLevelColors[player.experienceLevel]
								)}>
								{player.experienceLevel}
							</div>
						)}
					</div>

					{/* Basic Info */}
					<div className="flex-1">
						<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
							{player.name} {player.surname}
						</h1>

						{player.bio && (
							<p className="text-muted-foreground mb-4 max-w-xl">{player.bio}</p>
						)}

						{/* Meta info */}
						<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
							{player.location && (
								<div className="flex items-center gap-1.5">
									<MapPin size={14} className="text-primary" />
									<span>{player.location}</span>
								</div>
							)}
							{player.memberSince && (
								<div className="flex items-center gap-1.5">
									<Calendar size={14} className="text-primary" />
									<span>
										Joined{" "}
										{new Date(player.memberSince).toLocaleDateString("en-US", {
											month: "short",
											year: "numeric",
										})}
									</span>
								</div>
							)}
							{player.yearsPlaying && (
								<div className="flex items-center gap-1.5">
									<Circle size={14} className="text-primary" />
									<span>{player.yearsPlaying} years playing</span>
								</div>
							)}
						</div>

						{/* Social counts */}
						<div className="flex gap-6 mt-4">
							<div className="text-center">
								<span className="text-xl font-bold text-white">
									{player.followersCount}
								</span>
								<span className="text-sm text-muted-foreground ml-1">Followers</span>
							</div>
							<div className="text-center">
								<span className="text-xl font-bold text-white">
									{player.followingCount}
								</span>
								<span className="text-sm text-muted-foreground ml-1">Following</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					{!isOwnProfile && (
						<div className="flex flex-col gap-2 w-full md:w-auto">
							<Button
								leftIcon={<Mail size={16} />}
								onClick={onMessage}
								variant="solid"
								color="primary">
								Message
							</Button>
							{player.isFollowing ? (
								<Button
									leftIcon={<Bell size={16} />}
									onClick={onUnfollow}
									variant="outline"
									color="neutral">
									Following
								</Button>
							) : (
								<Button
									leftIcon={<Bell size={16} />}
									onClick={onFollow}
									variant="ghost"
									color="primary">
									Follow
								</Button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Physical Attributes */}
			{(player.height || player.verticalJump || player.reach) && (
				<div className="bg-background px-6 md:px-8 py-6 border-t border-border">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<Ruler size={18} className="text-primary" />
						Physical Attributes
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{player.height && (
							<StatCard
								icon={<Ruler size={16} />}
								label="Height"
								value={`${player.height}`}
								subValue="cm"
							/>
						)}
						{player.verticalJump && (
							<StatCard
								icon={<ArrowUp size={16} />}
								label="Vertical Jump"
								value={`${player.verticalJump}`}
								subValue="cm"
							/>
						)}
						{player.reach && (
							<StatCard
								icon={<Hand size={16} />}
								label="Reach"
								value={`${player.reach}`}
								subValue="cm"
							/>
						)}
						{player.dominantHand && (
							<StatCard
								label="Dominant Hand"
								value={player.dominantHand === "right" ? "Right" : "Left"}
							/>
						)}
					</div>
				</div>
			)}

			{/* Preferred Positions */}
			{player.preferredPositions && player.preferredPositions.length > 0 && (
				<div className="bg-background px-6 md:px-8 py-6 border-t border-border">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<Circle size={18} className="text-primary" />
						Preferred Positions
					</h2>
					<div className="flex flex-wrap gap-2">
						{player.preferredPositions.map((position, index) => (
							<span
								key={position}
								className={cn(
									"px-4 py-2 rounded-full text-sm font-medium",
									index === 0
										? "bg-primary text-white"
										: "bg-surface text-muted-foreground"
								)}>
								{positionLabels[position]}
							</span>
						))}
					</div>
				</div>
			)}

			{/* Skill Ratings */}
			{player.skillRatings && (
				<div className="bg-background px-6 md:px-8 py-6 border-t border-border">
					<h2 className="text-lg font-semibold text-white mb-4">
						Skill Ratings
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
						<SkillRatingBar
							label="Serve"
							value={player.skillRatings.serve}
							color="primary"
						/>
						<SkillRatingBar
							label="Attack"
							value={player.skillRatings.attack}
							color="accent"
						/>
						<SkillRatingBar
							label="Defense"
							value={player.skillRatings.defense}
							color="success"
						/>
						<SkillRatingBar
							label="Setting"
							value={player.skillRatings.setting}
							color="info"
						/>
						<SkillRatingBar
							label="Blocking"
							value={player.skillRatings.blocking}
							color="warning"
						/>
						<SkillRatingBar
							label="Reception"
							value={player.skillRatings.reception}
							color="primary"
						/>
					</div>
				</div>
			)}

			{/* Statistics */}
			{player.stats && (
				<div className="bg-background px-6 md:px-8 py-6 border-t border-border">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<Trophy size={18} className="text-primary" />
						Statistics
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
						<StatCard
							label="Games Played"
							value={player.stats.gamesPlayed}
							trend="up"
							trendValue="Active player"
						/>
						<StatCard
							label="Win Rate"
							value={`${winRate}%`}
							subValue={`${player.stats.gamesWon}W`}
						/>
						<StatCard
							label="Events Attended"
							value={player.stats.eventsAttended}
						/>
						<StatCard label="Total Points" value={player.stats.totalPoints} />
						<StatCard label="Aces" value={player.stats.aces} />
						<StatCard label="Blocks" value={player.stats.blocks} />
						<StatCard label="Kills" value={player.stats.kills} />
						<StatCard label="Assists" value={player.stats.assists} />
						<StatCard label="Digs" value={player.stats.digs} />
					</div>
				</div>
			)}

			{/* Badges */}
			{player.badges && player.badges.length > 0 && (
				<div className="bg-background px-6 md:px-8 py-6 border-t border-border rounded-b-2xl">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<span className="text-primary">🏅</span>
						Achievements
					</h2>
					<BadgeGrid badges={player.badges} maxDisplay={8} size="md" />
				</div>
			)}
		</div>
	);
};

export default PlayerProfileCard;

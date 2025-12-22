import { notFound } from "next/navigation";
import { EventsList } from "@/components";
import { loadEventsByFilter } from "@/lib/api/events";
import { getFullUserProfile } from "@/lib/api/user";
import {
	FullProfileDto,
	getDominantHandLabel,
	getVolleyballPositionLabel,
	getSkillLevelLabel,
	getClubRoleLabel
} from "@/lib/models/Profile";
import Image from "next/image";
import { MapPin, Calendar, Ruler, ArrowUp, Zap, TrendingUp, Award, History, Shield } from "lucide-react";

interface PublicProfileCardProps {
	profile: FullProfileDto;
}

const PublicProfileCard = ({ profile }: PublicProfileCardProps) => {
	const fullName = [profile.name, profile.surname].filter(Boolean).join(" ") || "Unknown User";

	return (
		<div className="bg-base-200 rounded-2xl overflow-hidden">
			{/* Header */}
			<div className="bg-gradient-to-r from-accent/20 to-purple-500/20 p-6 md:p-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<div className="relative">
						{profile.imageUrl ? (
							<Image
								src={profile.imageUrl}
								alt={fullName}
								width={120}
								height={120}
								className="rounded-full border-4 border-base-100 object-cover"
							/>
						) : (
							<div className="w-[120px] h-[120px] rounded-full border-4 border-base-100 bg-base-300 flex items-center justify-center text-4xl font-bold text-white/50">
								{(profile.name?.[0] || "?").toUpperCase()}
							</div>
						)}
					</div>
					<div className="text-center md:text-left">
						<h1 className="text-2xl md:text-3xl font-bold text-white">{fullName}</h1>
						{profile.bio && (
							<p className="text-white/70 mt-2 max-w-xl">{profile.bio}</p>
						)}
					</div>
				</div>
			</div>

			{/* Player Profile Stats */}
			{profile.playerProfile && (
				<div className="p-6 md:p-8 border-t border-white/5">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<TrendingUp className="text-accent" size={20} />
						Player Stats
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{profile.playerProfile.heightCm && (
							<div className="bg-base-300 rounded-xl p-4 flex items-center gap-3">
								<Ruler className="text-blue-500" size={20} />
								<div>
									<div className="text-xs text-muted">Height</div>
									<div className="font-semibold text-white">{profile.playerProfile.heightCm} cm</div>
								</div>
							</div>
						)}
						{profile.playerProfile.verticalJumpCm && (
							<div className="bg-base-300 rounded-xl p-4 flex items-center gap-3">
								<ArrowUp className="text-green-500" size={20} />
								<div>
									<div className="text-xs text-muted">Vertical Jump</div>
									<div className="font-semibold text-white">{profile.playerProfile.verticalJumpCm} cm</div>
								</div>
							</div>
						)}
						<div className="bg-base-300 rounded-xl p-4 flex items-center gap-3">
							<Zap className="text-purple-500" size={20} />
							<div>
								<div className="text-xs text-muted">Dominant Hand</div>
								<div className="font-semibold text-white">{getDominantHandLabel(profile.playerProfile.dominantHand)}</div>
							</div>
						</div>
						{profile.playerProfile.highestLevelPlayed !== undefined && (
							<div className="bg-base-300 rounded-xl p-4 flex items-center gap-3">
								<TrendingUp className="text-orange-500" size={20} />
								<div>
									<div className="text-xs text-muted">Highest Level</div>
									<div className="font-semibold text-white">{getSkillLevelLabel(profile.playerProfile.highestLevelPlayed)}</div>
								</div>
							</div>
						)}
					</div>

					{/* Positions */}
					{(profile.playerProfile.preferredPosition !== undefined || (profile.playerProfile.secondaryPositions && profile.playerProfile.secondaryPositions.length > 0)) && (
						<div className="mt-4">
							<div className="text-sm text-muted mb-2">Positions</div>
							<div className="flex flex-wrap gap-2">
								{profile.playerProfile.preferredPosition !== undefined && (
									<span className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-accent text-sm">
										{getVolleyballPositionLabel(profile.playerProfile.preferredPosition)} (Preferred)
									</span>
								)}
								{profile.playerProfile.secondaryPositions?.map((pos, idx) => (
									<span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/80 text-sm">
										{getVolleyballPositionLabel(pos)}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Coach Profile Stats */}
			{profile.coachProfile && (
				<div className="p-6 md:p-8 border-t border-white/5">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<Award className="text-accent" size={20} />
						Coach Profile
					</h2>
					<div className="grid grid-cols-2 gap-4 mb-4">
						{profile.coachProfile.yearsOfExperience && (
							<div className="bg-base-300 rounded-xl p-4">
								<div className="text-xs text-muted">Experience</div>
								<div className="font-semibold text-white">{profile.coachProfile.yearsOfExperience} Years</div>
							</div>
						)}
						{profile.coachProfile.highestLevelCoached !== undefined && (
							<div className="bg-base-300 rounded-xl p-4">
								<div className="text-xs text-muted">Highest Level Coached</div>
								<div className="font-semibold text-white">{getSkillLevelLabel(profile.coachProfile.highestLevelCoached)}</div>
							</div>
						)}
					</div>
					{profile.coachProfile.qualifications && profile.coachProfile.qualifications.length > 0 && (
						<div>
							<div className="text-sm text-muted mb-2">Qualifications</div>
							<div className="flex flex-wrap gap-2">
								{profile.coachProfile.qualifications.map((qual) => (
									<span key={qual.id} className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm">
										{qual.name} {qual.year > 0 && `(${qual.year})`}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* History */}
			{profile.historyEntries && profile.historyEntries.length > 0 && (
				<div className="p-6 md:p-8 border-t border-white/5">
					<h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
						<History className="text-accent" size={20} />
						Career History
					</h2>
					<div className="space-y-3">
						{profile.historyEntries
							.sort((a, b) => b.year - a.year)
							.slice(0, 5)
							.map((entry) => (
								<div key={entry.id} className="bg-base-300 rounded-xl p-4 flex items-center gap-4">
									{entry.clubLogoUrl ? (
										<Image src={entry.clubLogoUrl} alt={entry.clubName} width={40} height={40} className="rounded-lg" />
									) : (
										<div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
											<Shield size={20} className="text-muted" />
										</div>
									)}
									<div className="flex-1">
										<div className="font-semibold text-white">{entry.clubName}</div>
										<div className="text-sm text-muted">
											{getClubRoleLabel(entry.role)} {entry.teamName && `- ${entry.teamName}`}
										</div>
									</div>
									<div className="text-accent font-medium">{entry.year}</div>
								</div>
							))}
					</div>
				</div>
			)}
		</div>
	);
};

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	// Fetch real profile data from API
	const profile = await getFullUserProfile(id);

	if (!profile) {
		notFound();
	}

	const events = await loadEventsByFilter({ organizerId: id });

	return (
		<div className="container mx-auto px-4 py-6 max-w-5xl">
			<PublicProfileCard profile={profile} />

			{/* Events Section */}
			{events && events.length > 0 && (
				<div className="mt-8 bg-base-200 rounded-2xl p-6 md:p-8">
					<h2 className="text-lg font-semibold text-white mb-4">
						Organized Events
					</h2>
					<EventsList events={events} />
				</div>
			)}
		</div>
	);
};

export default ProfilePage;

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ id: string }>;
}) => {
	const { id } = await params;
	const profile = await getFullUserProfile(id);

	if (!profile) {
		return {
			title: "Profile Not Found",
			description: "The requested profile could not be found",
		};
	}

	const fullName = [profile.name, profile.surname].filter(Boolean).join(" ") || "User";

	return {
		title: `${fullName} - Profile`,
		description: `View ${fullName}'s volleyball profile and achievements`,
	};
};

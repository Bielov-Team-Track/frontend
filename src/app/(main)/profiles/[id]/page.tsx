import { EventsList, PlayerProfileCard } from "@/components";
import { PlayerProfile } from "@/lib/models/User";
import { loadEventsByFilter } from "@/lib/requests/events";

// Mock player profile data for demonstration
const getMockPlayerProfile = (userId: string): PlayerProfile => ({
	userId,
	email: "alex.volkov@example.com",
	name: "Alex",
	surname: "Volkov",
	imageUrl: "",
	bio: "Passionate volleyball player with 8 years of experience. Love competitive matches and helping new players improve their game.",
	location: "Kyiv, Ukraine",
	height: 192,
	verticalJump: 85,
	reach: 320,
	dominantHand: "right",
	preferredPositions: ["outside_hitter", "opposite", "middle_blocker"],
	skillRatings: {
		serve: 85,
		attack: 92,
		defense: 78,
		setting: 65,
		blocking: 88,
		reception: 72,
	},
	experienceLevel: "advanced",
	yearsPlaying: 8,
	stats: {
		gamesPlayed: 247,
		gamesWon: 168,
		eventsAttended: 52,
		totalPoints: 1842,
		aces: 156,
		blocks: 312,
		kills: 728,
		assists: 89,
		digs: 445,
	},
	badges: [
		{
			id: "1",
			name: "Tournament Champion",
			description: "Won a community tournament",
			icon: "🏆",
			earnedAt: "2024-06-15",
			rarity: "legendary",
		},
		{
			id: "2",
			name: "Ace Master",
			description: "Scored 100+ aces",
			icon: "🎯",
			earnedAt: "2024-03-20",
			rarity: "epic",
		},
		{
			id: "3",
			name: "Iron Wall",
			description: "Recorded 300+ blocks",
			icon: "🧱",
			earnedAt: "2024-08-10",
			rarity: "epic",
		},
		{
			id: "4",
			name: "Team Player",
			description: "Attended 50+ events",
			icon: "🤝",
			earnedAt: "2024-01-05",
			rarity: "rare",
		},
		{
			id: "5",
			name: "Early Bird",
			description: "Founding community member",
			icon: "🌅",
			earnedAt: "2023-06-01",
			rarity: "rare",
		},
		{
			id: "6",
			name: "Rising Star",
			description: "Won 100+ games",
			icon: "⭐",
			earnedAt: "2024-02-14",
			rarity: "common",
		},
		{
			id: "7",
			name: "Dedicated",
			description: "Played 200+ games",
			icon: "💪",
			earnedAt: "2024-09-01",
			rarity: "common",
		},
	],
	followersCount: 234,
	followingCount: 89,
	isFollowing: false,
	memberSince: "2023-06-01",
	lastActive: "2024-11-24",
});

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = await params;

	// Use mock data for demonstration
	const playerProfile = getMockPlayerProfile(id);

	const events = await loadEventsByFilter({ organizerId: id });

	return (
		<div className="container mx-auto px-4 py-6 max-w-5xl">
			<PlayerProfileCard
				player={playerProfile}
				isOwnProfile={false}
				onMessage={() => {}}
				onFollow={() => {}}
				onUnfollow={() => {}}
			/>

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
	// In production, fetch real profile data
	const playerProfile = getMockPlayerProfile(id);

	return {
		title: `${playerProfile.name} ${playerProfile.surname} - Player Profile`,
		description: `View ${playerProfile.name} ${playerProfile.surname}'s volleyball profile, stats, and achievements`,
	};
};

export interface BaseUser {
	email: string;
}

export interface User extends BaseUser {
	id: string;
}

export interface GoogleUserCreate {
	name: string;
	email: string;
	image: string;
}

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	surname: string;
	imageUrl: string;
	dateOfBirth?: Date;
}

export interface Suspension {
	active: boolean;
	reason: string;
}

// Volleyball-specific player profile data
export type VolleyballPosition = "setter" | "outside_hitter" | "opposite" | "middle_blocker" | "libero" | "defensive_specialist";

export interface SkillRatings {
	serve: number; // 0-100
	attack: number; // 0-100
	defense: number; // 0-100
	setting: number; // 0-100
	blocking: number; // 0-100
	reception: number; // 0-100
}

export interface PlayerStats {
	gamesPlayed: number;
	gamesWon: number;
	eventsAttended: number;
	totalPoints: number;
	aces: number;
	blocks: number;
	kills: number;
	assists: number;
	digs: number;
}

export interface Badge {
	id: string;
	name: string;
	description: string;
	icon: string;
	earnedAt: string;
	rarity: "common" | "rare" | "epic" | "legendary";
}

export interface PlayerProfile extends UserProfile {
	// Physical attributes
	height?: number; // in cm
	verticalJump?: number; // in cm
	reach?: number; // in cm
	dominantHand?: "left" | "right";

	// Volleyball-specific
	preferredPositions: VolleyballPosition[];
	skillRatings: SkillRatings;
	experienceLevel: "beginner" | "intermediate" | "advanced" | "professional";
	yearsPlaying?: number;

	// Statistics
	stats: PlayerStats;

	// Achievements
	badges: Badge[];

	// Social
	bio?: string;
	location?: string;
	followersCount: number;
	followingCount: number;
	isFollowing?: boolean;

	// Activity
	memberSince: string;
	lastActive?: string;
}

import { UserProfile } from "./User";

// Enums matching backend
export enum DominantHand {
	Right = 0,
	Left = 1,
	Ambidextrous = 2,
}

export enum SkillLevel {
	Beginner = 0,
	Intermediate = 1,
	Advanced = 2,
	National = 3,
	Professional = 4,
}

export enum VolleyballPosition {
	Setter = 0,
	OutsideHitter = 1,
	OppositeHitter = 2,
	MiddleBlocker = 3,
	Libero = 4,
}

export enum ClubRole {
	Player = 0,
	HeadCoach = 1,
	Coach = 2,
	AssistantCoach = 3,
	TeamManager = 4,
	Member = 5,
	Admin = 6,
}

// Response DTOs (from backend)
export interface QualificationDto {
	id: string;
	name: string;
	year: number;
}

export interface PlayerProfileDto {
	id: string;
	heightCm?: number;
	verticalJumpCm?: number;
	dominantHand: DominantHand;
	preferredPosition?: VolleyballPosition;
	secondaryPositions: VolleyballPosition[];
	highestLevelPlayed?: SkillLevel;
}

export interface CoachProfileDto {
	id: string;
	yearsOfExperience?: number;
	highestLevelCoached?: SkillLevel;
	qualifications: QualificationDto[];
}

export interface HistoryDto {
	id: string;
	year: number;
	clubName: string;
	clubLogoUrl?: string;
	teamName?: string;
	teamLogoUrl?: string;
	role: ClubRole;
	positions?: VolleyballPosition[];
}

// Extended profile with all sub-profiles
export interface FullProfileDto {
	userProfile?: UserProfile;
	playerProfile?: PlayerProfileDto;
	coachProfile?: CoachProfileDto;
	historyEntries?: HistoryDto[];
}

// Create/Update DTOs (for sending to backend)
export interface CreateQualificationDto {
	name: string;
	year: number;
}

export interface CreateOrUpdateCoachProfileDto {
	yearsOfExperience?: number | null;
	highestLevelCoached?: SkillLevel | null;
	qualifications?: CreateQualificationDto[];
}

export interface CreateOrUpdatePlayerProfileDto {
	heightCm?: number | null;
	weightKg?: number | null;
	verticalJumpCm?: number | null;
	dominantHand?: DominantHand;
	preferredPosition?: VolleyballPosition | null;
	secondaryPositions?: VolleyballPosition[];
	highestLevelPlayed?: SkillLevel | null;
}

export interface CreateHistoryDto {
	year: number;
	clubName: string;
	clubLogoUrl?: string | null;
	teamName?: string | null;
	teamLogoUrl?: string | null;
	role: ClubRole;
	positions?: VolleyballPosition[];
}

export interface UpdateHistoryDto {
	year?: number;
	clubName?: string;
	clubLogoUrl?: string | null;
	teamName?: string | null;
	teamLogoUrl?: string | null;
	role?: ClubRole;
	positions?: VolleyballPosition[];
}

export interface UpdateProfileDto {
	name?: string;
	surname?: string;
	imageUrl?: string;
	imageThumbHash?: string;
}

export interface CreateOrUpdateUserProfileDto {
	firstName?: string;
	lastName?: string;
	bio?: string;
	playerProfile?: CreateOrUpdatePlayerProfileDto;
	coachProfile?: CreateOrUpdateCoachProfileDto;
	history?: CreateHistoryDto[];
}

// Helper functions for enum display
export const getSkillLevelLabel = (level?: SkillLevel): string => {
	if (level === undefined) return "Not specified";
	const labels: Record<SkillLevel, string> = {
		[SkillLevel.Beginner]: "Beginner",
		[SkillLevel.Intermediate]: "Intermediate",
		[SkillLevel.Advanced]: "Advanced",
		[SkillLevel.National]: "National",
		[SkillLevel.Professional]: "Professional",
	};
	return labels[level] ?? "Unknown";
};

export const getVolleyballPositionLabel = (position?: VolleyballPosition): string => {
	if (position === undefined) return "";
	const labels: Record<VolleyballPosition, string> = {
		[VolleyballPosition.Setter]: "Setter",
		[VolleyballPosition.OutsideHitter]: "Outside Hitter",
		[VolleyballPosition.OppositeHitter]: "Opposite Hitter",
		[VolleyballPosition.MiddleBlocker]: "Middle Blocker",
		[VolleyballPosition.Libero]: "Libero",
	};
	return labels[position] ?? "Unknown";
};

export const getClubRoleLabel = (role?: ClubRole): string => {
	if (role === undefined) return "";
	const labels: Record<ClubRole, string> = {
		[ClubRole.Player]: "Player",
		[ClubRole.HeadCoach]: "Head Coach",
		[ClubRole.Coach]: "Coach",
		[ClubRole.AssistantCoach]: "Assistant Coach",
		[ClubRole.TeamManager]: "Team Manager",
		[ClubRole.Member]: "Member",
		[ClubRole.Admin]: "Admin",
	};
	return labels[role] ?? "Unknown";
};

export const getDominantHandLabel = (hand?: DominantHand): string => {
	if (hand === undefined) return "Not specified";
	const labels: Record<DominantHand, string> = {
		[DominantHand.Right]: "Right",
		[DominantHand.Left]: "Left",
		[DominantHand.Ambidextrous]: "Ambidextrous",
	};
	return labels[hand] ?? "Unknown";
};

// Drill Types and Interfaces

export type DrillCategory = "Warmup" | "Technical" | "Tactical" | "Game" | "Conditioning" | "Cooldown";
export type DrillIntensity = "Low" | "Medium" | "High";
export type DrillSkill = "Serving" | "Passing" | "Setting" | "Attacking" | "Blocking" | "Defense" | "Conditioning" | "Footwork";

// Animation Types
export interface PlayerPosition {
	id: string;
	x: number;
	y: number;
	color: string;
	label?: string;
	firstFrameIndex?: number; // Frame index where element first appears
	note?: string; // Note/instruction attached to this element
}

export type EquipmentType = "cone" | "target" | "ball" | "hoop" | "ladder" | "hurdle" | "antenna";

export interface EquipmentItem {
	id: string;
	type: EquipmentType;
	x: number;
	y: number;
	rotation?: number;
	firstFrameIndex?: number; // Frame index where element first appears
	note?: string; // Note/instruction attached to this element
	label?: string; // Custom label for the equipment (max 20 chars, shows first 3)
}

export type CourtViewMode = "full" | "half" | "empty";

export const EQUIPMENT_DEFINITIONS: Record<EquipmentType, { name: string; icon: string; color: string }> = {
	cone: { name: "Cone", icon: "🔺", color: "#f97316" },
	target: { name: "Target", icon: "🎯", color: "#ef4444" },
	ball: { name: "Ball", icon: "🏐", color: "#fef3c7" },
	hoop: { name: "Hoop", icon: "⭕", color: "#3b82f6" },
	ladder: { name: "Ladder", icon: "🪜", color: "#eab308" },
	hurdle: { name: "Hurdle", icon: "🚧", color: "#22c55e" },
	antenna: { name: "Antenna", icon: "📍", color: "#a855f7" },
};

export interface AnimationKeyframe {
	id: string;
	players: PlayerPosition[];
	ball: { x: number; y: number };
	equipment?: EquipmentItem[];
}

export interface DrillAnimation {
	keyframes: AnimationKeyframe[];
	speed: number; // ms per frame transition
}

export interface DrillEquipment {
	id: string;
	name: string;
	isOptional: boolean;
	order: number;
}

export interface DrillEquipmentInput {
	name: string;
	isOptional: boolean;
}

export interface DrillAuthor {
	id: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
}

export interface Drill {
	id: string;
	name: string;
	duration: number;
	category: DrillCategory;
	intensity: DrillIntensity;
	skills: DrillSkill[];
	description: string;
	instructions?: string[];
	coachingPoints?: string[];
	variations?: string[];
	equipment?: DrillEquipment[];
	minPlayers?: number;
	maxPlayers?: number;
	animation?: DrillAnimation;
	likeCount?: number;
	bookmarkCount?: number;
	isLiked?: boolean;
	isBookmarked?: boolean;
	clubId?: string;
	clubName?: string;
	clubLogoUrl?: string;
	author?: DrillAuthor;
}

export interface TimelineItem extends Drill {
	instanceId: string;
	notes?: string;
}

// Constants
export const SKILLS: DrillSkill[] = ["Serving", "Passing", "Setting", "Attacking", "Blocking", "Defense", "Conditioning", "Footwork"];
export const CATEGORIES: DrillCategory[] = ["Warmup", "Technical", "Tactical", "Game", "Conditioning", "Cooldown"];
export const INTENSITIES: DrillIntensity[] = ["Low", "Medium", "High"];

// Badge color mappings for UI components
export const INTENSITY_COLORS: Record<DrillIntensity, { color: "success" | "warning" | "error" }> = {
	Low: { color: "success" },
	Medium: { color: "warning" },
	High: { color: "error" },
};

export const CATEGORY_COLORS: Record<DrillCategory, { color: "secondary" | "info" | "primary" | "accent" | "warning" | "success" }> = {
	Warmup: { color: "secondary" },
	Technical: { color: "info" },
	Tactical: { color: "primary" },
	Game: { color: "accent" },
	Conditioning: { color: "warning" },
	Cooldown: { color: "success" },
};

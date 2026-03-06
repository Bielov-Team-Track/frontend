import type { DrillCategory, DrillIntensity } from "@/lib/models/Drill";

// Segment colors — used for timeline bar fills
export const CATEGORY_SEGMENT_COLORS: Record<DrillCategory, string> = {
	Warmup: "#29757A",
	Technical: "#2E5A88",
	Tactical: "#FF7D00",
	Game: "#D99100",
	Conditioning: "#BE3F23",
	Cooldown: "#4A7A45",
};

export const INTENSITY_SEGMENT_COLORS: Record<DrillIntensity, string> = {
	Low: "#4A7A45",
	Medium: "#D99100",
	High: "#BE3F23",
};

// Pill / badge colors — brighter for readability on dark backgrounds
export const CATEGORY_PILL_COLORS: Record<DrillCategory, string> = {
	Warmup: "#3DBCC4",
	Technical: "#5B9BD5",
	Tactical: "#FF9533",
	Game: "#FFBC33",
	Conditioning: "#E85A3D",
	Cooldown: "#6ABF62",
};

export const INTENSITY_PILL_COLORS: Record<DrillIntensity, string> = {
	Low: "#6ABF62",
	Medium: "#FFBC33",
	High: "#E85A3D",
};

// Human-friendly labels
export const CATEGORY_LABELS: Record<DrillCategory, string> = {
	Warmup: "Warm-up",
	Technical: "Technical",
	Tactical: "Tactical",
	Game: "Game",
	Conditioning: "Fitness",
	Cooldown: "Cool-down",
};

export const INTENSITY_LABELS: Record<DrillIntensity, string> = {
	Low: "Light",
	Medium: "Moderate",
	High: "Intense",
};

// Section color palette – hex values matching the wizard's palette
export const SECTION_COLORS = [
	{ color: "#FF7D00", line: "#FF7D00" },
	{ color: "#29757A", line: "#29757A" },
	{ color: "#2E5A88", line: "#2E5A88" },
	{ color: "#D99100", line: "#D99100" },
	{ color: "#4A7A45", line: "#4A7A45" },
	{ color: "#BE3F23", line: "#BE3F23" },
];

// Map skills to badge colors for visual variety
export const SKILL_COLOR_MAP: Record<string, "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error"> = {
	Serving: "accent",
	Passing: "info",
	Setting: "secondary",
	Attacking: "error",
	Blocking: "warning",
	Defense: "primary",
	Conditioning: "success",
	Footwork: "accent",
};

export function getSkillBadgeColor(skill: string): "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" {
	return SKILL_COLOR_MAP[skill] || "info";
}

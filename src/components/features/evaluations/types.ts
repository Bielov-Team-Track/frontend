// Volleyball skills that metrics can measure
export const VOLLEYBALL_SKILLS = [
	"Passing",
	"Setting",
	"Defending",
	"Serving",
	"Attacking",
	"Blocking",
	"Game",
] as const;

export type VolleyballSkill = (typeof VOLLEYBALL_SKILLS)[number];

// Metric types for evaluation exercises
export const METRIC_TYPES = ["Checkbox", "Slider", "Number", "Ratio"] as const;

export type MetricType = (typeof METRIC_TYPES)[number];

// Sort options for exercises
export type ExerciseSortBy = "createdAt" | "name" | "metricCount";
export type ExerciseSortOrder = "asc" | "desc";

export interface ExerciseSortOption {
	label: string;
	sortBy: ExerciseSortBy;
	sortOrder: ExerciseSortOrder;
}

export const EXERCISE_SORT_OPTIONS: ExerciseSortOption[] = [
	{ label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
	{ label: "Oldest First", sortBy: "createdAt", sortOrder: "asc" },
	{ label: "Name (A-Z)", sortBy: "name", sortOrder: "asc" },
	{ label: "Name (Z-A)", sortBy: "name", sortOrder: "desc" },
	{ label: "Most Metrics", sortBy: "metricCount", sortOrder: "desc" },
	{ label: "Fewest Metrics", sortBy: "metricCount", sortOrder: "asc" },
];

// Metric type config for display
export const METRIC_TYPE_CONFIG: Record<MetricType, { label: string; description: string; color: string }> = {
	Checkbox: { label: "Yes/No", description: "Pass or fail check", color: "text-emerald-400 bg-emerald-500/15" },
	Slider: { label: "Slider", description: "Score on a scale", color: "text-sky-400 bg-sky-500/15" },
	Number: { label: "Number", description: "Numeric value", color: "text-amber-400 bg-amber-500/15" },
	Ratio: { label: "Ratio", description: "Success out of attempts", color: "text-violet-400 bg-violet-500/15" },
};

// Skill color mapping for badges
export const SKILL_COLORS: Record<VolleyballSkill, string> = {
	Passing: "text-sky-400 bg-sky-500/15",
	Setting: "text-violet-400 bg-violet-500/15",
	Defending: "text-emerald-400 bg-emerald-500/15",
	Serving: "text-amber-400 bg-amber-500/15",
	Attacking: "text-rose-400 bg-rose-500/15",
	Blocking: "text-orange-400 bg-orange-500/15",
	Game: "text-pink-400 bg-pink-500/15",
};

// Helper to extract unique skills from exercise metrics
export function getExerciseSkills(metrics: { skillWeights: { skill: string }[] }[]): string[] {
	const skills = new Set<string>();
	metrics.forEach((m) => m.skillWeights.forEach((sw) => skills.add(sw.skill)));
	return Array.from(skills);
}

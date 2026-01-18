import { EventFormat, EventType, PlayingSurface } from "@/lib/models/Event";

export const eventTypeOptions = [
	{ value: EventType.CasualPlay, label: "Casual" },
	{ value: EventType.Match, label: "Match" },
	{ value: EventType.Social, label: "Social" },
	{ value: EventType.TrainingSession, label: "Training" },
];

export const eventFormatOptions = [
	{ value: EventFormat.Open, label: "Open (No Teams - Individual Join)" },
	{ value: EventFormat.OpenTeams, label: "Open Teams (Generic Players)" },
	{
		value: EventFormat.TeamsWithPositions,
		label: "Teams with Positions (Volleyball Positions)",
	},
];

export const surfaceOptions = [
	{ value: PlayingSurface.Indoor, label: "Indoor" },
	{ value: PlayingSurface.Grass, label: "Grass" },
	{ value: PlayingSurface.Beach, label: "Beach" },
];

export const STEP_VALIDATION_FIELDS = {
	1: ["name", "type", "surface", "isPrivate"],
	2: [
		// Single event fields
		"startTime",
		"endTime",
		// Recurring event fields (conditional validation in schema)
		"isRecurring",
		"recurrencePattern",
		"firstOccurrenceDate",
		"seriesEndDate",
		"eventStartTime",
		"eventEndTime",
	],
	3: ["location.name"],
	4: ["registrationType"],
	5: [], // Budget step - validation handled dynamically based on useBudget
	6: [], // Review step - no validation needed
} as const;

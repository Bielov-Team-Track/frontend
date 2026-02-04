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

export const STEP_VALIDATION_FIELDS: Record<number, string[]> = {
	1: ["name", "type"], // Basics - conditional validation for recurring/non-recurring handled in hook
	2: ["location.name"], // Location
	3: ["eventFormat"], // Participants & Payment - conditional validation handled in hook
	4: [], // Review step - no validation
};

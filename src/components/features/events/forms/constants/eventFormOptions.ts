import { EventType, EventFormat, PlayingSurface } from "@/lib/models/Event";

export const eventTypeOptions = [
	{ value: EventType.CasualPlay, label: "Casual" },
	{ value: EventType.Tournament, label: "Tournament" },
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
	1: ["name", "type", "surface"],
	2: ["startTime", "endTime"],
	3: ["location.address"],
	4: ["eventFormat", "courtsNumber"],
	5: [], // Budget step - validation handled dynamically based on ignoreBudget
	6: [], // Review step - no validation needed
} as const;

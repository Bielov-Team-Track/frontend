import { EventFormat, EventType, PlayingSurface } from "@/lib/models/Event";

export const eventTypeOptions = [
	{ value: EventType.CasualPlay, label: "Casual" },
	{ value: EventType.Match, label: "Match" },
	{ value: EventType.Social, label: "Social" },
	{ value: EventType.TrainingSession, label: "Training" },
];

export const eventFormatOptions = [
	{ value: EventFormat.List, label: "Open (No Teams - Individual Join)" },
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
	2: [], // Location - optional step, no required fields
	3: ["eventFormat"], // Participants - conditional validation handled in hook
	4: [], // Payment - conditional validation handled in hook
	5: [], // Review step - no validation
};

/**
 * Maps top-level form field names to their wizard step number.
 * Used to determine which step to navigate to when validation errors occur.
 */
const FIELD_STEP_MAP: Record<string, number> = {
	name: 1,
	type: 1,
	isRecurring: 1,
	eventDate: 1,
	startTime: 1,
	endTime: 1,
	eventStartTime: 1,
	eventEndTime: 1,
	recurrencePattern: 1,
	firstOccurrenceDate: 1,
	seriesEndDate: 1,
	surface: 1,
	description: 1,
	location: 2,
	eventFormat: 3,
	registrationUnit: 3,
	capacity: 3,
	teamsNumber: 3,
	casualPlayFormat: 3,
	isPublic: 3,
	usePaymentConfig: 4,
	paymentConfig: 4,
	usePayments: 4,
	paymentsConfig: 4,
	useBudget: 4,
	budget: 4,
};

/** Returns the step number that a field belongs to */
export function getStepForField(fieldPath: string): number {
	if (FIELD_STEP_MAP[fieldPath]) return FIELD_STEP_MAP[fieldPath];
	const prefix = fieldPath.split(".")[0];
	return FIELD_STEP_MAP[prefix] || 1;
}

/** Returns the lowest step number that has a validation error */
export function getFirstErrorStep(errors: Record<string, unknown>): number | null {
	let minStep = Infinity;
	for (const field of Object.keys(errors)) {
		const step = getStepForField(field);
		if (step < minStep) minStep = step;
	}
	return minStep === Infinity ? null : minStep;
}

/** Returns sorted array of step numbers that have validation errors */
export function getErrorSteps(errors: Record<string, unknown>): number[] {
	const steps = new Set<number>();
	for (const field of Object.keys(errors)) {
		steps.add(getStepForField(field));
	}
	return [...steps].sort();
}

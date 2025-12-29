import EventBudgetStep from "../steps/EventBudgetStep";
import { EventDetailsStep } from "../steps/EventDetailsStep";
import { EventSettingsStep } from "../steps/EventSettingsStep";
import { LocationStep } from "../steps/LocationStep";
import { ReviewStep } from "../steps/ReviewStep";
import { TimeAndDateStep } from "../steps/TimeAndDateStep";

export interface StepConfig {
	id: string | number;
	label: string;
	key: string;
	component: React.ComponentType;
}

export const STEP_CONFIG: Record<number, StepConfig> = {
	1: {
		id: 1,
		label: "Event Details",
		key: "details",
		component: EventDetailsStep,
	},
	2: {
		id: 2,
		label: "Time & Date",
		key: "datetime",
		component: TimeAndDateStep,
	},
	3: {
		id: 3,
		label: "Location",
		key: "location",
		component: LocationStep,
	},
	4: {
		id: 4,
		label: "Settings",
		key: "settings",
		component: EventSettingsStep,
	},
	5: {
		id: 5,
		label: "Budget",
		key: "budget",
		component: EventBudgetStep,
	},
	6: {
		id: 6,
		label: "Review",
		key: "review",
		component: ReviewStep,
	},
} as const;

export const TOTAL_STEPS = Object.keys(STEP_CONFIG).length;

// Helper to get active steps (useful if you want to conditionally include steps)
export function getActiveSteps(): number[] {
	return Object.keys(STEP_CONFIG).map(Number).sort();
}

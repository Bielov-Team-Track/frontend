import { EventDetailsStep } from "../steps/EventDetailsStep";
import { TimeAndDateStep } from "../steps/TimeAndDateStep";
import { LocationStep } from "../steps/LocationStep";
import { EventSettingsStep } from "../steps/EventSettingsStep";
import { ReviewStep } from "../steps/ReviewStep";
import EventBudgetStep from "../steps/EventBudgetStep";

export interface StepConfig {
  label: string;
  key: string;
  component: React.ComponentType;
}

export const STEP_CONFIG: Record<number, StepConfig> = {
  1: {
    label: "Event Details",
    key: "details",
    component: EventDetailsStep
  },
  2: {
    label: "Time & Date",
    key: "datetime",
    component: TimeAndDateStep
  },
  3: {
    label: "Location",
    key: "location",
    component: LocationStep
  },
  4: {
    label: "Settings",
    key: "settings",
    component: EventSettingsStep
  },
  5: {
    label: "Budget",
    key: "budget",
    component: EventBudgetStep
  },
  6: {
    label: "Review",
    key: "review",
    component: ReviewStep
  },
} as const;

export const TOTAL_STEPS = Object.keys(STEP_CONFIG).length;

// Helper to get active steps (useful if you want to conditionally include steps)
export function getActiveSteps(): number[] {
  return Object.keys(STEP_CONFIG).map(Number).sort();
}
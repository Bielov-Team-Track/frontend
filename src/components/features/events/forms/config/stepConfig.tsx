import { lazy } from "react";

const BasicsStep = lazy(() => import("../steps/BasicsStep"));
const LocationStep = lazy(() => import("../steps/LocationStep"));
const ParticipantsPaymentStep = lazy(() => import("../steps/ParticipantsPaymentStep"));
const ReviewStep = lazy(() => import("../steps/ReviewStep"));

export interface StepConfig {
  id: number;
  label: string;
  key: string;
  component: React.LazyExoticComponent<React.ComponentType>;
}

export const STEP_CONFIG: Record<number, StepConfig> = {
  1: {
    id: 1,
    label: "Basics",
    key: "basics",
    component: BasicsStep,
  },
  2: {
    id: 2,
    label: "Location",
    key: "location",
    component: LocationStep,
  },
  3: {
    id: 3,
    label: "Participants & Payment",
    key: "participants-payment",
    component: ParticipantsPaymentStep,
  },
  4: {
    id: 4,
    label: "Review",
    key: "review",
    component: ReviewStep,
  },
};

export const TOTAL_STEPS = 4;

export const getActiveSteps = (): number[] => {
  return Object.keys(STEP_CONFIG)
    .map(Number)
    .sort((a, b) => a - b);
};

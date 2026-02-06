import { lazy } from "react";

const BasicsStep = lazy(() => import("../steps/BasicsStep"));
const LocationStep = lazy(() => import("../steps/LocationStep"));
const ParticipantsPaymentStep = lazy(() => import("../steps/ParticipantsPaymentStep"));
const PaymentStep = lazy(() => import("../steps/PaymentStep"));
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
    label: "Participants",
    key: "participants",
    component: ParticipantsPaymentStep,
  },
  4: {
    id: 4,
    label: "Payment",
    key: "payment",
    component: PaymentStep,
  },
  5: {
    id: 5,
    label: "Review",
    key: "review",
    component: ReviewStep,
  },
};

export const TOTAL_STEPS = 5;

export const getActiveSteps = (): number[] => {
  return Object.keys(STEP_CONFIG)
    .map(Number)
    .sort((a, b) => a - b);
};

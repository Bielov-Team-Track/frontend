export enum PricingModel {
  Individual = "Individual",
  Team = "Team",
  Event = "Event", // Future use
}

export const PricingModelOptions = [
  {
    value: PricingModel.Individual,
    label: "Individual (fixed cost per person)",
  },
  { value: PricingModel.Team, label: "Team (fixed cost per team)" },
  {
    value: PricingModel.Event,
    label: "Event (event cost that will be split between participants)",
  },
];

export enum Unit {
  Team = "Team",
  Individual = "Individual",
}

export const RegistrationUnitOptions = [
  { value: Unit.Individual, label: "Individual (single person can enter)" },
  { value: Unit.Team, label: "Team (only full teams can enter)" },
];

export interface EventBudget {
  id?: string;
  currency?: string; // Optional, default to USD or system default
  // Core pricing logic
  pricingModel: PricingModel;
  // Price configuration - single field for both strategies
  cost: number; // For FIXED: price per unit, For BUDGET_SPLIT: total budget to split
  // Business rules
  payToJoin?: boolean; // If true, payment is required to join
  minUnitsForBudget?: number | undefined; // Safety minimum for budget split
  // Timing rules
  dropoutDeadlineHours?: number | undefined; // Hours before event when registrations lock (for budget split)
}

export interface CreateEventBudget {
  name: string;
  description?: string;
  pricingModel: PricingModel;
  cost: number;
  minUnitsForBudget?: number;
  dropoutDeadlineHours?: number;
}
